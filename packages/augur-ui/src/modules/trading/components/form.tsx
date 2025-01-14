/* eslint jsx-a11y/label-has-for: 0 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { BigNumber, createBigNumber } from 'utils/create-big-number';
import {
  SCALAR,
  MIN_QUANTITY,
  UPPER_FIXED_PRECISION_BOUND,
  BUY,
  SELL,
  INVALID_OUTCOME_ID,
  NETWORK_IDS,
  GAS_CONFIRM_ESTIMATE,
  ONE,
} from 'modules/common/constants';
import FormStyles from 'modules/common/form-styles.less';
import Styles from 'modules/trading/components/form.styles.less';
import { ExclamationCircle } from 'modules/common/icons';
import { SquareDropdown } from 'modules/common/selection';
import { TextInput } from 'modules/common/form';
import getPrecision from 'utils/get-number-precision';
import convertExponentialToDecimal from 'utils/convert-exponential';
import { MarketData, OutcomeFormatted } from 'modules/types';
import {
  convertDisplayAmountToOnChainAmount,
  tickSizeToNumTickWithDisplayPrices,
  getTradeInterval,
  QUINTILLION,
  Getters,
} from '@augurproject/sdk';
import {
  CancelTextButton,
  TextButtonFlip,
  SecondaryButton,
} from 'modules/common/buttons';
import moment, { Moment } from 'moment';
import { convertUnixToFormattedDate } from 'utils/format-date';
import { SimpleTimeSelector } from 'modules/create-market/components/common';
import { formatBestPrice } from 'utils/format-number';
import { getNetworkId } from 'modules/contracts/actions/contractCalls';

const DEFAULT_TRADE_INTERVAL = new BigNumber(10 ** 17);
const TRADE_INTERVAL_VALUE = new BigNumber(10 ** 19);

const DEFAULT_EXPIRATION_DAYS = 30;

enum ADVANCED_OPTIONS {
  GOOD_TILL = '0',
  EXPIRATION = '1',
  FILL = '2',
}

enum EXPIRATION_DATE_OPTIONS {
  DAYS = '0',
  CUSTOM = '1',
}

const advancedDropdownOptions = [
  {
    label: 'Good till cancelled',
    value: ADVANCED_OPTIONS.GOOD_TILL,
  },
  {
    label: 'Order expiration',
    value: ADVANCED_OPTIONS.EXPIRATION,
  },
  {
    label: 'Fill only',
    value: ADVANCED_OPTIONS.FILL,
  },
];

interface FromProps {
  market: MarketData;
  marketType: string;
  maxPrice: BigNumber;
  minPrice: BigNumber;
  orderQuantity: string;
  orderPrice: string;
  orderDaiEstimate: string;
  orderEscrowdDai: string;
  selectedNav: string;
  selectedOutcome: Getters.Markets.MarketInfoOutcome;
  updateState: Function;
  sortedOutcomes: OutcomeFormatted[];
  updateOrderProperty: Function;
  doNotCreateOrders: boolean;
  expirationDate?: Moment;
  updateSelectedOutcome: Function;
  clearOrderForm: Function;
  updateTradeTotalCost: Function;
  updateTradeNumShares: Function;
  clearOrderConfirmation: Function;
  initialLiquidity?: Boolean;
  orderBook: Getters.Markets.OutcomeOrderBook;
  availableDai: BigNumber;
  currentTimestamp: number;
  Ox_ENABLED: boolean;
  tradingTutorial?: boolean;
  gasCostEst: string;
  orderPriceEntered: Function;
  orderAmountEntered: Function;
  gasPrice: number;
}

interface TestResults {
  isOrderValid: boolean;
  errors: object;
  errorCount: number;
}

interface FormState {
  isOrderValid: boolean;
  lastInputModified: string;
  [item: string]: string;
  errors: object;
  errorCount: number;
  showAdvanced: boolean;
  advancedOption: string;
  fastForwardDays: number;
  expirationDateOption: string;
  expirationDate?: Moment;
  percentage: string;
  confirmationTimeEstimation: number;
}

class Form extends Component<FromProps, FormState> {
  INPUT_TYPES: {
    MULTIPLE_QUANTITY: string;
    QUANTITY: string;
    PRICE: string;
    DO_NOT_CREATE_ORDERS: string;
    EST_DAI: string;
    SELECTED_NAV: string;
    EXPIRATION_DATE: string;
  };

  MINIMUM_TRADE_VALUE: BigNumber;

  constructor(props) {
    super(props);

    this.INPUT_TYPES = {
      MULTIPLE_QUANTITY: 'multipleOrderQuantity',
      QUANTITY: 'orderQuantity',
      PRICE: 'orderPrice',
      DO_NOT_CREATE_ORDERS: 'doNotCreateOrders',
      EST_DAI: 'orderDaiEstimate',
      SELECTED_NAV: 'selectedNav',
      EXPIRATION_DATE: 'expirationDate',
    };

    this.MINIMUM_TRADE_VALUE = createBigNumber(1, 10).dividedBy(10000);
    this.orderValidation = this.orderValidation.bind(this);
    this.testQuantityAndExpiry = this.testQuantityAndExpiry.bind(this);
    this.testPrice = this.testPrice.bind(this);
    this.testTotal = this.testTotal.bind(this);

    const startState = {
      [this.INPUT_TYPES.QUANTITY]: props.orderQuantity,
      [this.INPUT_TYPES.PRICE]: props.orderPrice,
      [this.INPUT_TYPES.DO_NOT_CREATE_ORDERS]: props.doNotCreateOrders,
      [this.INPUT_TYPES.EXPIRATION_DATE]: props.expirationDate,
      [this.INPUT_TYPES.SELECTED_NAV]: props.selectedNav,
      [this.INPUT_TYPES.EST_DAI]: props.orderDaiEstimate,
      errors: {
        [this.INPUT_TYPES.MULTIPLE_QUANTITY]: [],
        [this.INPUT_TYPES.QUANTITY]: [],
        [this.INPUT_TYPES.PRICE]: [],
        [this.INPUT_TYPES.EST_DAI]: [],
        [this.INPUT_TYPES.EXPIRATION_DATE]: [],
      },
    };

    this.state = {
      ...startState,
      isOrderValid: this.orderValidation(startState).isOrderValid,
      lastInputModified: '',
      errorCount: 0,
      showAdvanced: false,
      advancedOption: advancedDropdownOptions[0].value,
      fastForwardDays: DEFAULT_EXPIRATION_DAYS,
      expirationDateOption: EXPIRATION_DATE_OPTIONS.DAYS,
      percentage: '',
      confirmationTimeEstimation: 0,
    };

    this.changeOutcomeDropdown = this.changeOutcomeDropdown.bind(this);
    this.updateTestProperty = this.updateTestProperty.bind(this);
    this.clearOrderFormProperties = this.clearOrderFormProperties.bind(this);
    this.updateAndValidate = this.updateAndValidate.bind(this);
    this.calcPercentagePrice = this.calcPercentagePrice.bind(this);
  }

  async componentDidUpdate(prevProps) {
    const networkId = getNetworkId();
    const endPoint = GAS_CONFIRM_ESTIMATE[networkId];
    if (
      endPoint &&
      this.props.gasPrice !== prevProps.gasPrice &&
      this.props.gasPrice
    ) {
      const gasConfirmEstimateResponse = await fetch(
        `${endPoint}${this.props.gasPrice}`
      );
      const gasConfirmEstimate = await gasConfirmEstimateResponse.json();
      this.setState({ confirmationTimeEstimation: gasConfirmEstimate.result });
    }

    this.updateTestProperty(this.INPUT_TYPES.QUANTITY, this.props);
    this.updateTestProperty(this.INPUT_TYPES.PRICE, this.props);
    this.updateTestProperty(this.INPUT_TYPES.EST_DAI, this.props);
    this.updateTestProperty(this.INPUT_TYPES.EXPIRATION_DATE, this.props);

    if (
      this.props[this.INPUT_TYPES.DO_NOT_CREATE_ORDERS] !==
      this.state[this.INPUT_TYPES.DO_NOT_CREATE_ORDERS]
    ) {
      this.setState({
        [this.INPUT_TYPES.DO_NOT_CREATE_ORDERS]: this.props[
          this.INPUT_TYPES.DO_NOT_CREATE_ORDERS
        ],
      });
    }
    if (
      !!prevProps[this.INPUT_TYPES.PRICE] &&
      !!!this.props[this.INPUT_TYPES.PRICE]
    ) {
      this.setState({ percentage: '' });
    }
  }

  updateTestProperty(property, nextProps) {
    const { clearOrderConfirmation } = this.props;
    if (nextProps[property] !== this.state[property]) {
      this.setState(
        {
          [property]: nextProps[property],
        },
        () => {
          const newOrderInfo = {
            ...this.state,
            [property]: nextProps[property],
          };
          const { isOrderValid, errors, errorCount } = this.orderValidation(
            newOrderInfo,
            undefined,
            nextProps,
            true
          );
          if (errorCount > 0) {
            clearOrderConfirmation();
          }
          this.setState({
            ...newOrderInfo,
            errors,
            isOrderValid,
            errorCount,
          });
        }
      );
    }
  }

  testTotal(value, errors, isOrderValid, price, quantity): TestResults {
    let errorCount = 0;
    let passedTest = !!isOrderValid;
    if (value === '' && price && !!!quantity) {
      return { isOrderValid: false, errors, errorCount };
    }
    if (value && createBigNumber(value).lt(0)) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.EST_DAI].push(
        'Total Order Value must be greater than 0'
      );
    }
    return { isOrderValid: passedTest, errors, errorCount };
  }

  findNearestValues = value => {
    const { market } = this.props;
    let tradeInterval = DEFAULT_TRADE_INTERVAL;
    let numTicks = market.numTicks;

    if (!numTicks) {
      numTicks = tickSizeToNumTickWithDisplayPrices(
        createBigNumber(market.tickSize),
        createBigNumber(market.minPrice),
        createBigNumber(market.maxPrice)
      );
    }

    if (market.marketType == SCALAR) {
      tradeInterval = getTradeInterval(
        createBigNumber(market.minPrice).times(QUINTILLION),
        createBigNumber(market.maxPrice).times(QUINTILLION),
        numTicks
      );
    }

    const valueBn = createBigNumber(value);
    const multipleOf = tradeInterval
      .dividedBy(market.tickSize)
      .dividedBy(10 ** 18);
    let firstValue = valueBn.minus(valueBn.mod(multipleOf));
    let secondValue = valueBn.plus(multipleOf).minus(valueBn.mod(multipleOf));
    if (firstValue.lt(ONE)) {
      firstValue = secondValue;
      secondValue = valueBn
        .plus(multipleOf)
        .plus(multipleOf)
        .minus(valueBn.mod(multipleOf));
    }

    return [firstValue, secondValue];
  };

  testQuantityAndExpiry(
    value,
    errors: object,
    isOrderValid: boolean,
    fromExternal: boolean,
    nextProps,
    expiration?
  ): TestResults {
    const props = nextProps || this.props;
    const { market } = props;
    const isScalar: boolean = market.marketType === SCALAR;
    let errorCount = 0;
    let passedTest = !!isOrderValid;
    const precision = getPrecision(value, 0);

    if (!BigNumber.isBigNumber(value)) {
      return { isOrderValid: false, errors, errorCount };
    }

    if (value && value.lte(0)) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.QUANTITY].push('Quantity must be greater than 0');
    }
    if (value && value.lt(0.000000001) && !value.eq(0) && !fromExternal) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.QUANTITY].push(
        'Quantity must be greater than 0.000000001'
      );
    }
    if (
      !isScalar &&
      value &&
      precision > UPPER_FIXED_PRECISION_BOUND &&
      !fromExternal
    ) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.QUANTITY].push(
        `Precision must be ${UPPER_FIXED_PRECISION_BOUND} decimals or less`
      );
    }

    let numTicks = market.numTicks;
    if (!numTicks) {
      numTicks = tickSizeToNumTickWithDisplayPrices(
        createBigNumber(market.tickSize),
        createBigNumber(market.minPrice),
        createBigNumber(market.maxPrice)
      );
    }

    let tradeInterval = DEFAULT_TRADE_INTERVAL;
    if (market.marketType == SCALAR) {
      tradeInterval = getTradeInterval(
        createBigNumber(market.minPrice).times(QUINTILLION),
        createBigNumber(market.maxPrice).times(QUINTILLION),
        numTicks
      );
    }

    if (
      !convertDisplayAmountToOnChainAmount(value, market.tickSize)
        .mod(tradeInterval)
        .isEqualTo(0)
    ) {
      errorCount += 1;
      passedTest = false;
      const multipleOf = tradeInterval
        .dividedBy(market.tickSize)
        .dividedBy(10 ** 18);
      let firstValue = value.minus(value.mod(multipleOf));
      let secondValue = value.plus(multipleOf).minus(value.mod(multipleOf));
      if (firstValue.lt(ONE)) {
        firstValue = secondValue;
        secondValue = value
          .plus(multipleOf)
          .plus(multipleOf)
          .minus(value.mod(multipleOf));
      }
      errors[this.INPUT_TYPES.MULTIPLE_QUANTITY].push(
        `Quantity needs to be a multiple of ${multipleOf}`
      );
    }

    // Check to ensure orders don't expiry within 70s
    // Also consider getGasConfirmEstimate * 1.5 seconds
    const minOrderLifespan = 70;
    const gasConfirmEstimate = this.state.confirmationTimeEstimation * 1.5; // In Seconds
    const expiryTime = expiration - gasConfirmEstimate - moment().unix();
    if (expiration && expiryTime < minOrderLifespan) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.EXPIRATION_DATE].push(
        'Order expires less than 70 seconds into the future (after est confirmation time)'
      );
    }
    return { isOrderValid: passedTest, errors, errorCount };
  }

  testPrice(
    value,
    errors: object,
    isOrderValid: boolean,
    nextProps
  ): TestResults {
    const props = nextProps || this.props;
    const {
      maxPrice,
      minPrice,
      market,
      initialLiquidity,
      selectedNav,
      orderBook,
      selectedOutcome,
    } = props;
    const isScalar: boolean = market.marketType === SCALAR;
    const isScalarInvalidOutcome =
      isScalar && selectedOutcome.id === INVALID_OUTCOME_ID;
    const tickSize = createBigNumber(market.tickSize);
    let errorCount = 0;
    let passedTest = !!isOrderValid;

    if (!BigNumber.isBigNumber(value)) {
      return { isOrderValid: false, errors, errorCount };
    }

    if (value && (value.lte(minPrice) || value.gte(maxPrice))) {
      errorCount += 1;
      passedTest = false;
      if (isScalarInvalidOutcome) {
        errors[this.INPUT_TYPES.PRICE].push(`Enter a valid percentage`);
      } else {
        errors[this.INPUT_TYPES.PRICE].push(
          `Price must be between ${minPrice} and ${maxPrice}`
        );
      }
    }
    if (
      value &&
      value
        .minus(minPrice)
        .mod(tickSize)
        .gt('0')
    ) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.PRICE].push(
        `Price must be a multiple of ${tickSize}`
      );
    }
    if (
      initialLiquidity &&
      selectedNav === BUY &&
      orderBook.asks &&
      orderBook.asks.length &&
      value.gte(orderBook.asks[0].price)
    ) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.PRICE].push(
        `Price must be less than best ask of ${orderBook.asks[0].price}`
      );
    } else if (
      initialLiquidity &&
      selectedNav === SELL &&
      orderBook.bids &&
      orderBook.bids.length &&
      value.lte(orderBook.bids[0].price)
    ) {
      errorCount += 1;
      passedTest = false;
      errors[this.INPUT_TYPES.PRICE].push(
        `Price must be more than best bid of ${orderBook.bids[0].price}`
      );
    }
    return { isOrderValid: passedTest, errors, errorCount };
  }

  testPropertyCombo(
    quantity: string,
    price: string,
    estEth: string,
    changedProperty: string | undefined,
    errors: object
  ): TestResults {
    let errorCount = 0;
    if (quantity && estEth && !price) {
      errorCount += 1;
      errors[this.INPUT_TYPES.PRICE].push(
        'Price is needed with Quantity or Total Value'
      );
    }
    if (
      changedProperty === this.INPUT_TYPES.QUANTITY &&
      createBigNumber(quantity).lte(0)
    ) {
      errorCount += 1;
      errors[this.INPUT_TYPES.QUANTITY].push('Quantity must be greater than 0');
    }
    if (
      changedProperty === this.INPUT_TYPES.EST_DAI &&
      createBigNumber(estEth).lte(0)
    ) {
      errorCount += 1;
      errors[this.INPUT_TYPES.EST_DAI].push(
        'Total Order Value must be greater than 0'
      );
    }

    return { isOrderValid: errorCount === 0, errors, errorCount };
  }

  orderValidation(
    order,
    changedProperty?: string,
    nextProps?: FromProps,
    fromExternal = false
  ): TestResults {
    let errors = {
      [this.INPUT_TYPES.MULTIPLE_QUANTITY]: [],
      [this.INPUT_TYPES.QUANTITY]: [],
      [this.INPUT_TYPES.PRICE]: [],
      [this.INPUT_TYPES.EST_DAI]: [],
      [this.INPUT_TYPES.EXPIRATION_DATE]: [],
    };
    let isOrderValid = true;
    let errorCount = 0;

    const price =
      order[this.INPUT_TYPES.PRICE] &&
      createBigNumber(order[this.INPUT_TYPES.PRICE]);

    const quantity =
      order[this.INPUT_TYPES.QUANTITY] &&
      createBigNumber(order[this.INPUT_TYPES.QUANTITY]);

    const total =
      order[this.INPUT_TYPES.EST_DAI] &&
      createBigNumber(order[this.INPUT_TYPES.EST_DAI]);

    let expiration = null;
    if (order[this.INPUT_TYPES.EXPIRATION_DATE]) {
      expiration = moment(order[this.INPUT_TYPES.EXPIRATION_DATE]).unix();
    }

    const {
      isOrderValid: priceValid,
      errors: priceErrors,
      errorCount: priceErrorCount,
    } = this.testPrice(price, errors, isOrderValid, nextProps);

    errorCount += priceErrorCount;
    errors = { ...errors, ...priceErrors };

    let quantityValid = true;

    if (changedProperty !== this.INPUT_TYPES.EST_DAI) {
      const {
        isOrderValid: isThisOrderValid,
        errors: quantityErrors,
        errorCount: quantityErrorCount,
      } = this.testQuantityAndExpiry(
        quantity,
        errors,
        isOrderValid,
        fromExternal,
        nextProps,
        expiration
      );

      quantityValid = isThisOrderValid;
      errorCount += quantityErrorCount;
      errors = { ...errors, ...quantityErrors };
    }

    const {
      isOrderValid: totalValid,
      errors: totalErrors,
      errorCount: totalErrorCount,
    } = this.testTotal(total, errors, isOrderValid, price, quantity);

    errorCount += totalErrorCount;
    errors = { ...errors, ...totalErrors };

    const {
      isOrderValid: comboValid,
      errors: comboErrors,
      errorCount: comboErrorCount,
    } = this.testPropertyCombo(
      order[this.INPUT_TYPES.QUANTITY],
      order[this.INPUT_TYPES.PRICE],
      order[this.INPUT_TYPES.EST_DAI],
      changedProperty,
      errors
    );

    errors = { ...errors, ...comboErrors };
    errorCount += comboErrorCount;

    isOrderValid = priceValid && quantityValid && totalValid && comboValid;
    return { isOrderValid, errors, errorCount };
  }

  updateAndValidate(property: string, rawValue) {
    const { updateOrderProperty } = this.props;
    const newValues = { [property]: rawValue };
    this.setState(newValues);
    updateOrderProperty(newValues);
    return this.validateForm(property, rawValue);
  }

  validateForm(property: string, rawValue) {
    const {
      updateTradeTotalCost,
      updateTradeNumShares,
      selectedNav,
      clearOrderForm,
    } = this.props;

    const value =
      property != 'expirationDate'
        ? convertExponentialToDecimal(rawValue)
        : rawValue;
    const updatedState = {
      ...this.state,
      [property]: value,
    };

    const validationResults = this.orderValidation(
      updatedState,
      property,
      this.props
    );

    if (validationResults.errorCount > 0) {
      clearOrderForm(false);
    }

    let orderQuantity = updatedState[this.INPUT_TYPES.QUANTITY];
    const orderPrice = updatedState[this.INPUT_TYPES.PRICE];
    let orderDaiEstimate = updatedState[this.INPUT_TYPES.EST_DAI];
    let expiration = updatedState[this.INPUT_TYPES.EXPIRATION_DATE];

    if (property === this.INPUT_TYPES.QUANTITY) {
      orderDaiEstimate = '';
    } else if (
      property === this.INPUT_TYPES.EST_DAI ||
      (property === this.INPUT_TYPES.EST_DAI && value === '')
    ) {
      orderQuantity = '';
    }

    const order = {
      [this.INPUT_TYPES.QUANTITY]: orderQuantity
        ? createBigNumber(orderQuantity).toFixed()
        : orderQuantity,
      [this.INPUT_TYPES.PRICE]: orderPrice
        ? createBigNumber(orderPrice).toFixed()
        : orderPrice,
      [this.INPUT_TYPES.EST_DAI]: orderDaiEstimate
        ? createBigNumber(orderDaiEstimate).toFixed()
        : orderDaiEstimate,
      [this.INPUT_TYPES.EXPIRATION_DATE]: expiration,
      selectedNav,
    };

    // update the local state of this form then make call to calculate total or shares
    this.setState(
      {
        ...updatedState,
        errors: {
          ...validationResults.errors,
        },
        errorCount: validationResults.errorCount,
        isOrderValid: validationResults.isOrderValid,
      },
      () => {
        if (
          validationResults.errorCount === 0 &&
          validationResults.isOrderValid
        ) {
          if (
            order[this.INPUT_TYPES.QUANTITY] &&
            order[this.INPUT_TYPES.PRICE] &&
            order[this.INPUT_TYPES.QUANTITY] !== '0' &&
            (((!this.state.lastInputModified ||
              this.state.lastInputModified === this.INPUT_TYPES.QUANTITY) &&
              property === this.INPUT_TYPES.PRICE) ||
              property === this.INPUT_TYPES.QUANTITY)
          ) {
            updateTradeTotalCost(order);
          } else if (
            order[this.INPUT_TYPES.EST_DAI] &&
            order[this.INPUT_TYPES.PRICE] &&
            order[this.INPUT_TYPES.EST_DAI] !== '0' &&
            ((this.state.lastInputModified === this.INPUT_TYPES.EST_DAI &&
              property === this.INPUT_TYPES.PRICE) ||
              property === this.INPUT_TYPES.EST_DAI)
          ) {
            updateTradeNumShares(order);
          }
          if (
            order[this.INPUT_TYPES.QUANTITY] &&
            order[this.INPUT_TYPES.PRICE] &&
            order[this.INPUT_TYPES.EST_DAI] &&
            order[this.INPUT_TYPES.EST_DAI] != 0 &&
            order[this.INPUT_TYPES.QUANTITY] != 0 &&
            property === this.INPUT_TYPES.EXPIRATION_DATE
          ) {
            updateTradeTotalCost(order);
          }
        }
        if (property !== this.INPUT_TYPES.PRICE) {
          this.setState({
            lastInputModified: property,
          });
        }
      }
    );
  }

  clearOrderFormProperties() {
    const { selectedNav, clearOrderForm } = this.props;
    const startState = {
      [this.INPUT_TYPES.QUANTITY]: '',
      [this.INPUT_TYPES.PRICE]: '',
      [this.INPUT_TYPES.DO_NOT_CREATE_ORDERS]: false,
      [this.INPUT_TYPES.EXPIRATION_DATE]: null,
      [this.INPUT_TYPES.SELECTED_NAV]: selectedNav,
      [this.INPUT_TYPES.EST_DAI]: '',
      errors: {
        [this.INPUT_TYPES.MULTIPLE_QUANTITY]: [],
        [this.INPUT_TYPES.QUANTITY]: [],
        [this.INPUT_TYPES.PRICE]: [],
        [this.INPUT_TYPES.EST_DAI]: [],
        [this.INPUT_TYPES.EXPIRATION_DATE]: [],
      },
    };
    this.setState(
      {
        ...startState,
        isOrderValid: false,
        percentage: '',
      },
      () => clearOrderForm()
    );
  }

  changeOutcomeDropdown(value) {
    const { updateSelectedOutcome } = this.props;
    updateSelectedOutcome(value);
  }

  updateTotalValue(percent: Number) {
    const { availableDai } = this.props;

    const value = availableDai
      .times(createBigNumber(percent))
      .integerValue(BigNumber.ROUND_DOWN);
    this.setState({ [this.INPUT_TYPES.EST_DAI]: value.toString() }, () =>
      this.validateForm(this.INPUT_TYPES.EST_DAI, value.toString())
    );
  }

  calcPercentagePrice(
    percentage: string,
    minPrice: string,
    tickSize: number,
    numTicks: string
  ) {
    if (!percentage) return Number(minPrice);
    const percentNumTicks = createBigNumber(numTicks).times(
      createBigNumber(percentage).dividedBy(100)
    );
    const calcPrice = percentNumTicks
      .times(tickSize)
      .plus(createBigNumber(minPrice));
    const correctDec = formatBestPrice(calcPrice, tickSize);
    return correctDec.full;
  }

  render() {
    const {
      market,
      marketType,
      selectedOutcome,
      maxPrice,
      minPrice,
      updateState,
      orderEscrowdDai,
      updateSelectedOutcome,
      sortedOutcomes,
      initialLiquidity,
      currentTimestamp,
      Ox_ENABLED,
      tradingTutorial,
      orderPriceEntered,
      orderAmountEntered,
      selectedNav,
    } = this.props;
    const s = this.state;

    const tickSize = parseFloat(market.tickSize);
    const numTicks = market.numTicks;
    const max = maxPrice && maxPrice.toString();
    const min = minPrice && minPrice.toString();
    const errors = Array.from(
      new Set([
        ...s.errors[this.INPUT_TYPES.QUANTITY],
        ...s.errors[this.INPUT_TYPES.PRICE],
        ...s.errors[this.INPUT_TYPES.EST_DAI],
        ...s.errors[this.INPUT_TYPES.EXPIRATION_DATE],
      ])
    );

    const quantityValue = convertExponentialToDecimal(
      s[this.INPUT_TYPES.QUANTITY]
    );
    const isScalar: boolean = marketType === SCALAR;
    // TODO: figure out default outcome after we figure out ordering of the outcomes
    const defaultOutcome = selectedOutcome !== null ? selectedOutcome.id : 2;
    let advancedOptions = advancedDropdownOptions;
    if (!Ox_ENABLED) {
      advancedOptions = [advancedOptions[0], advancedOptions[2]];
    }
    const showLimitPriceInput =
      (isScalar && selectedOutcome.id !== INVALID_OUTCOME_ID) || !isScalar;

    const nearestValues = this.findNearestValues(quantityValue);
    return (
      <div className={Styles.TradingForm}>
        <div className={Styles.Outcome}>
          <SquareDropdown
            defaultValue={defaultOutcome}
            onChange={value => updateSelectedOutcome(value)}
            options={sortedOutcomes
              .filter(outcome => outcome.isTradeable)
              .map(outcome => ({
                label: outcome.description,
                value: outcome.id,
              }))}
            large
            showColor
          />
        </div>
        <ul>
          <li>
            <label htmlFor="quantity">Quantity</label>
            <div
              className={classNames(Styles.TradingFormInputContainer, {
                [Styles.error]: s.errors[this.INPUT_TYPES.QUANTITY].length,
              })}
            >
              <input
                className={classNames(
                  FormStyles.Form__input,
                  Styles.TradingFormInput,
                  {
                    [`${Styles.error}`]: s.errors[this.INPUT_TYPES.QUANTITY]
                      .length,
                  }
                )}
                id="quantity"
                type="number"
                step={
                  quantityValue && quantityValue !== ''
                    ? MIN_QUANTITY.toFixed()
                    : 1
                }
                placeholder="0.00"
                value={quantityValue}
                tabIndex={tradingTutorial ? -1 : 1}
                onTouchStart={e =>
                  e.target.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  })
                }
                onChange={e => {
                  this.updateAndValidate(
                    this.INPUT_TYPES.QUANTITY,
                    e.target.value
                  );
                }}
                onBlur={e => {
                  if (!initialLiquidity && !tradingTutorial)
                    orderAmountEntered(selectedNav, market.id);
                }}
              />
              <span
                className={classNames({
                  [`${Styles.error}`]: s.errors[this.INPUT_TYPES.QUANTITY]
                    .length,
                })}
              >
                Shares
              </span>
            </div>
          </li>
          {showLimitPriceInput && (
            <li>
              <label htmlFor="limit-price">Limit Price</label>
              <div
                className={classNames(Styles.TradingFormInputContainer, {
                  [Styles.error]: s.errors[this.INPUT_TYPES.PRICE].length,
                })}
              >
                <input
                  className={classNames(
                    FormStyles.Form__input,
                    Styles.TradingFormInput
                  )}
                  id="limit-price"
                  type="number"
                  step={tickSize}
                  max={max}
                  min={min}
                  placeholder="0.00"
                  tabIndex={tradingTutorial ? -1 : 2}
                  value={s[this.INPUT_TYPES.PRICE]}
                  onTouchStart={e =>
                    e.target.scrollIntoView({
                      block: 'nearest',
                      behavior: 'smooth',
                    })
                  }
                  onChange={e =>
                    this.updateAndValidate(
                      this.INPUT_TYPES.PRICE,
                      e.target.value
                    )
                  }
                  onBlur={e => {
                    if (!initialLiquidity && !tradingTutorial)
                      orderPriceEntered(selectedNav, market.id);
                  }}
                />
                <span
                  className={classNames({
                    [`${Styles.isScalar_largeText}`]:
                      isScalar &&
                      (market.scalarDenomination || []).length <= 24,
                    [`${Styles.isScalar_smallText}`]:
                      isScalar && (market.scalarDenomination || []).length > 24,
                    [`${Styles.error}`]: s.errors[this.INPUT_TYPES.PRICE]
                      .length,
                  })}
                >
                  {isScalar ? market.scalarDenomination : '$'}
                </span>
              </div>
            </li>
          )}
          {!showLimitPriceInput && (
            <li>
              <label htmlFor="percentage">Percentage</label>
              <div className={classNames(Styles.TradingFormInputContainer)}>
                <input
                  className={classNames(
                    FormStyles.Form__input,
                    Styles.TradingFormInput
                  )}
                  id="percentage"
                  type="number"
                  step={0.1}
                  max={99}
                  min={1}
                  placeholder="0"
                  tabIndex={tradingTutorial ? -1 : 2}
                  value={this.state.percentage}
                  onTouchStart={e =>
                    e.target.scrollIntoView({
                      block: 'nearest',
                      behavior: 'smooth',
                    })
                  }
                  onChange={e => {
                    const percentage = e.target.value;
                    this.setState({ percentage }, () => {
                      const value = this.calcPercentagePrice(
                        percentage,
                        min,
                        tickSize,
                        numTicks
                      );
                      this.updateAndValidate(this.INPUT_TYPES.PRICE, value);
                    });
                  }}
                />
                <span>%</span>
              </div>
            </li>
          )}
          <li>
            <label htmlFor="total-order-value">Total Order Value</label>
            <div
              className={classNames(Styles.TradingFormInputContainer, {
                [`${Styles.error}`]: s.errors[this.INPUT_TYPES.EST_DAI].length,
              })}
            >
              <input
                className={classNames(
                  FormStyles.Form__input,
                  Styles.TradingFormInput,
                  {
                    [`${Styles.error}`]: s.errors[this.INPUT_TYPES.EST_DAI]
                      .length,
                  }
                )}
                id="total-order-value"
                type="number"
                disabled={!!initialLiquidity || !showLimitPriceInput}
                step={MIN_QUANTITY.toFixed()}
                min={MIN_QUANTITY.toFixed()}
                placeholder="0.00"
                tabIndex={tradingTutorial ? -1 : 2}
                value={
                  s[this.INPUT_TYPES.EST_DAI]
                    ? createBigNumber(s[this.INPUT_TYPES.EST_DAI]).toNumber()
                    : s[this.INPUT_TYPES.EST_DAI]
                }
                onTouchStart={e =>
                  e.target.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  })
                }
                onChange={e =>
                  this.updateAndValidate(
                    this.INPUT_TYPES.EST_DAI,
                    e.target.value
                  )
                }
              />
              <span
                className={classNames({
                  [`${Styles.error}`]: s.errors[this.INPUT_TYPES.EST_DAI]
                    .length,
                })}
              >
                $
              </span>
            </div>
          </li>
          {!initialLiquidity && (
            <li>
              <CancelTextButton
                text="25%"
                action={() => this.updateTotalValue(0.25)}
              />
              <CancelTextButton
                text="50%"
                action={() => this.updateTotalValue(0.5)}
              />
              <CancelTextButton
                text="75%"
                action={() => this.updateTotalValue(0.75)}
              />
              <CancelTextButton
                text="100%"
                action={() => this.updateTotalValue(1)}
              />
              <CancelTextButton
                text="clear"
                action={() => this.clearOrderFormProperties()}
              />
            </li>
          )}
          <li>
            <label
              className={
                initialLiquidity ? Styles.Liquidity : Styles.smallLabel
              }
            >
              {ExclamationCircle}
              <span>
                {`Max cost of $${
                  orderEscrowdDai === '' ? '-' : orderEscrowdDai
                } will be escrowed`}
              </span>
            </label>
          </li>
          {!initialLiquidity && (
            <li>
              <TextButtonFlip
                text="Advanced"
                action={() => {
                  this.setState({
                    advancedOption: '0',
                    fastForwardDays: DEFAULT_EXPIRATION_DAYS,
                    expirationDateOption: '0',
                    showAdvanced: !s.showAdvanced,
                  });
                }}
                pointDown={s.showAdvanced}
              />
            </li>
          )}
          {s.showAdvanced && (
            <li
              className={classNames(Styles.AdvancedShown, {
                [`${Styles.error}`]: s.errors[this.INPUT_TYPES.EXPIRATION_DATE]
                  .length,
              })}
            >
              <SquareDropdown
                defaultValue={advancedOptions[0].value}
                options={advancedOptions}
                onChange={value => {
                  const date =
                    value === ADVANCED_OPTIONS.EXPIRATION
                      ? moment
                          .unix(currentTimestamp)
                          .add(DEFAULT_EXPIRATION_DAYS, 'days')
                      : '';
                  this.updateAndValidate(
                    this.INPUT_TYPES.EXPIRATION_DATE,
                    date
                  );
                  updateState({
                    [this.INPUT_TYPES.DO_NOT_CREATE_ORDERS]:
                      value === ADVANCED_OPTIONS.FILL,
                  });
                  this.setState({
                    advancedOption: value,
                    fastForwardDays: DEFAULT_EXPIRATION_DAYS,
                    expirationDateOption: '0',
                  });
                }}
              />
              {s.advancedOption === '1' && (
                <>
                  <div>
                    {s.expirationDateOption === EXPIRATION_DATE_OPTIONS.DAYS && (
                      <TextInput
                        value={s.fastForwardDays.toString()}
                        placeholder={'0'}
                        onChange={value => {
                          const days =
                            value === '' || isNaN(value) ? 0 : parseInt(value);
                          this.updateAndValidate(
                            this.INPUT_TYPES.EXPIRATION_DATE,
                            moment.unix(currentTimestamp).add(days, 'days')
                          );
                          this.setState({ fastForwardDays: days });
                        }}
                      />
                    )}
                    <SquareDropdown
                      defaultValue={EXPIRATION_DATE_OPTIONS.DAYS}
                      options={[
                        {
                          label: 'Days',
                          value: EXPIRATION_DATE_OPTIONS.DAYS,
                        },
                        {
                          label: 'Custom',
                          value: EXPIRATION_DATE_OPTIONS.CUSTOM,
                        },
                      ]}
                      onChange={value => {
                        this.setState({ expirationDateOption: value });
                      }}
                    />
                  </div>
                  {s.expirationDateOption === EXPIRATION_DATE_OPTIONS.DAYS && (
                    <span>
                      {
                        convertUnixToFormattedDate(
                          moment(s[this.INPUT_TYPES.EXPIRATION_DATE]) &&
                            moment(s[this.INPUT_TYPES.EXPIRATION_DATE]).unix()
                        ).formattedLocalShortWithUtcOffset
                      }
                    </span>
                  )}
                  {s.expirationDateOption ===
                    EXPIRATION_DATE_OPTIONS.CUSTOM && (
                    <SimpleTimeSelector
                      onChange={value => {
                        this.updateAndValidate(
                          this.INPUT_TYPES.EXPIRATION_DATE,
                          moment.unix(value.timestamp)
                        );
                      }}
                      currentTime={currentTimestamp}
                    />
                  )}
                </>
              )}
              {s.advancedOption === ADVANCED_OPTIONS.FILL && (
                <span className={Styles.tipText}>
                  Fill Only will fill up to the specified amount. Can be
                  partially filled and will cancel the remaining balance.
                </span>
              )}
              <span
                className={classNames({
                  [`${Styles.error}`]: s.errors[
                    this.INPUT_TYPES.EXPIRATION_DATE
                  ].length,
                })}
              ></span>
            </li>
          )}
        </ul>
        {s.errors[this.INPUT_TYPES.MULTIPLE_QUANTITY].length > 0 && (
          <div className={Styles.ErrorContainer}>
            {s.errors[this.INPUT_TYPES.MULTIPLE_QUANTITY].map((error, key) => (
              <div key={error} className={Styles.ErrorClickable}>
                {ExclamationCircle} <span>{error}</span>
                <span>Please select from the closest quantities</span>
                <div>
                  <SecondaryButton
                    action={() =>
                      this.updateAndValidate(
                        this.INPUT_TYPES.QUANTITY,
                        nearestValues[0].toString()
                      )
                    }
                    text={nearestValues[0].toString()}
                  />
                  <SecondaryButton
                    action={() =>
                      this.updateAndValidate(
                        this.INPUT_TYPES.QUANTITY,
                        nearestValues[1].toString()
                      )
                    }
                    text={nearestValues[1].toString()}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.length > 0 && (
          <div className={Styles.ErrorContainer}>
            {errors.map(error => (
              <div key={error} className={Styles.Error}>
                {ExclamationCircle} <span>{error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default Form;
