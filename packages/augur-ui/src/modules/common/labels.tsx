import React from 'react';
import classNames from 'classnames';
import * as constants from 'modules/common/constants';
import Styles from 'modules/common/labels.styles.less';
import { ClipLoader } from 'react-spinners';
import {
  CheckCircleIcon,
  HintAlternate,
  LoadingEllipse,
  MarketIcon,
  QuestionIcon,
  RedFlagIcon,
  ScalarIcon,
  TemplateIcon,
  YellowTemplateIcon,
} from 'modules/common/icons';
import ReactTooltip from 'react-tooltip';
import TooltipStyles from 'modules/common/tooltip.styles.less';
import { createBigNumber } from 'utils/create-big-number';
import {
  SELL,
  BOUGHT,
  PROBABLE_INVALID_MARKET,
  SOLD,
  CLOSED,
  SHORT,
  ZERO,
  YES_NO,
  SCALAR,
  CATEGORICAL,
  REPORTING_STATE,
  DISCORD_LINK,
  ACCOUNT_TYPES,
} from 'modules/common/constants';
import { ViewTransactionDetailsButton } from 'modules/common/buttons';
import { formatNumber } from 'utils/format-number';
import { DateFormattedObject, FormattedNumber, SizeTypes } from 'modules/types';
import { Getters, TXEventName } from '@augurproject/sdk';
import {
  DISMISSABLE_NOTICE_BUTTON_TYPES,
  DismissableNotice,
} from 'modules/reporting/common';
import { EventDetailsContent } from 'modules/create-market/constants';
import { ExplainerBlock } from 'modules/create-market/components/common';
import { hasTemplateTextInputs } from '@augurproject/artifacts';
import { getDurationBetween } from 'utils/format-date';

export interface MarketTypeProps {
  marketType: string;
}

export interface MarketStatusProps {
  reportingState: string;
}

export interface InReportingLabelProps extends MarketStatusProps {
  disputeInfo: Getters.Markets.DisputeInfo;
}

export interface MovementLabelProps {
  value: FormattedNumber;
  size?: SizeTypes;
  styles?: object;
  showIcon?: boolean;
  showBrackets?: boolean;
  showPlusMinus?: boolean;
  useFull?: boolean;
  hideNegative?: boolean;
}

export interface MovementIconProps {
  value: number;
  size: SizeTypes;
}

export interface MovementTextProps {
  value: FormattedNumber;
  numberValue: number;
  size: SizeTypes;
  showBrackets: boolean;
  showPlusMinus: boolean;
  useFull: boolean;
  hideNegative: boolean;
}

export interface PropertyLabelProps {
  label: string;
  value: string;
  hint?: React.ReactNode;
}

export interface LinearPropertyLabelProps {
  label: string;
  value: string | FormattedNumber;
  accentValue?: boolean;
  highlightFirst?: boolean;
  highlight?: boolean;
  highlightAlternateBolded?: boolean;
  highlightAlternate?: boolean;
  useValueLabel?: boolean;
  showDenomination?: boolean;
  useFull?: boolean;
}

export interface LinearPropertyLabelTooltipProps {
  label: string;
  value: string;
}

export interface LinearPropertyLabelPercentMovementProps {
  label: string;
  value: string;
  accentValue?: boolean;
  movementValue: FormattedNumber;
  showIcon?: boolean;
  showBrackets?: boolean;
  showPercent?: boolean;
  showPlusMinus?: boolean;
  useValueLabel?: boolean;
  useFull?: boolean;
}

export interface PillLabelProps {
  label: string;
  hideOnMobile?: boolean;
}

export interface PositionTypeLabelProps {
  type: string;
  pastTense: boolean;
}

export interface LinearPropertyLabelViewTransactionProps {
  transactionHash: string;
  highlightFirst?: boolean;
}

export interface ValueLabelProps {
  value: FormattedNumber;
  showDenomination?: boolean;
  keyId?: string;
  showEmptyDash?: boolean;
  useFull?: boolean;
  alert?: boolean;
}

interface SizableValueLabelProps extends ValueLabelProps {
  size: SizeTypes;
  highlight?: boolean;
}

interface HoverValueLabelState {
  hover: boolean;
}

export interface TextLabelProps {
  text: string;
  keyId?: string;
}

export interface InvalidLabelProps extends TextLabelProps {
  openInvalidMarketRulesModal?: Function;
  tooltipPositioning?: string;
}

export interface TextLabelState {
  scrollWidth: string | null;
  clientWidth: string | null;
  isDisabled: boolean;
}

export interface RepBalanceProps {
  rep: string;
  alternate?: boolean;
  larger?: boolean;
}

export interface MarketStateLabelProps {
  label: string;
  count: number;
  loading: boolean;
  selected: boolean;
  handleClick: Function;
  marketType: string;
}

interface ButtonObj {
  label: string;
  onClick: Function;
}

interface WordTrailProps {
  typeLabel: string;
  items: Array<ButtonObj>;
  children: Array<any>;
}

interface CategoryTagTrailProps {
  categories: Array<ButtonObj>;
}

interface ValueDenominationProps {
  valueClassname?: string | null;
  className?: string | null;
  value?: number | null;
  formatted?: string | null;
  fullPrecision?: string | null;
  denomination?: string | null;
  hidePrefix?: Boolean;
  hidePostfix?: Boolean;
  prefix?: string | null;
  postfix?: string | null;
  hideDenomination?: Boolean;
}

interface TimeLabelProps {
  label: string;
  time: DateFormattedObject;
  showLocal?: boolean;
  hint?: React.ReactNode;
}

interface CountdownLabelProps {
  expiry: DateFormattedObject;
  currentTimestamp: Number;
}

export const CountdownLabel = ({ expiry, currentTimestamp }: CountdownLabelProps) => {
  if (!expiry) return null;
  const duration = getDurationBetween(expiry.timestamp, currentTimestamp);
  const hours = duration.asHours();
  if (hours > 1) return null;
  return (
    <div className={Styles.CountdownLabel}>
      {Math.round(duration.asMinutes())}m
    </div>
  );
};

interface RedFlagProps {
  market: Getters.Markets.MarketInfo;
}

export const RedFlag = ({ market }: RedFlagProps) => {
  return market.mostLikelyInvalid ? (
    <>
      <label
        className={TooltipStyles.TooltipHint}
        data-tip
        data-for={`tooltip-${market.id}-redFlag`}
      >
        {RedFlagIcon}
      </label>
      <ReactTooltip
        id={`tooltip-${market.id}-redFlag`}
        className={TooltipStyles.Tooltip}
        effect="solid"
        place="right"
        type="light"
      >
        {PROBABLE_INVALID_MARKET}
      </ReactTooltip>
    </>
  ) : null;
};

interface TemplateShieldProps {
  market: Getters.Markets.MarketInfo;
}

export const TemplateShield = ({ market }: TemplateShieldProps) => {
  const yellowShield = hasTemplateTextInputs(market.template.hash);
  return (
    <>
      <label
        className={TooltipStyles.TooltipHint}
        data-tip
        data-for={`tooltip-${market.id}-templateShield`}
      >
        {yellowShield ? YellowTemplateIcon : TemplateIcon}
      </label>
      <ReactTooltip
        id={`tooltip-${market.id}-templateShield`}
        className={TooltipStyles.Tooltip}
        effect="solid"
        place="right"
        type="light"
      >
        {yellowShield
          ? "Templated market question, contains market creator text. This text should match to highlighted section's tooltip"
          : 'Template markets have predefined terms and have a smaller chance of resolving as invalid'}
      </ReactTooltip>
    </>
  );
};

export const TimeLabel = ({ label, time, showLocal, hint }: TimeLabelProps) => (
  <div className={Styles.TimeLabel}>
    <span>
      {label}
      {hint && (
        <>
          <label
            className={TooltipStyles.TooltipHint}
            data-tip
            data-for={`tooltip-${label.replace(' ', '-')}`}
          >
            {QuestionIcon}
          </label>
          <ReactTooltip
            id={`tooltip-${label.replace(' ', '-')}`}
            className={TooltipStyles.Tooltip}
            effect="solid"
            place="right"
            type="light"
          >
            {hint}
          </ReactTooltip>
        </>
      )}
    </span>
    <span>{time && time.formattedShortUtc}</span>
    {showLocal && (
      <span>{time && time.formattedLocalShortDateTimeWithTimezone}</span>
    )}
  </div>
);

export const DashlineNormal = () => (
  <svg width="100%" height="1">
    <line x1="0" x2="100%" y1="0" y2="0" className={Styles.Dashline} />
  </svg>
);

export const DashlineLong = () => (
  <svg width="100%" height="1">
    <line x1="0" x2="100%" y1="0" y2="0" className={Styles.DashlineLong} />
  </svg>
);

export function formatExpandedValue(
  value,
  showDenomination,
  fixedPrecision = false,
  max = '1000',
  min = '0.0001'
) {
  const { fullPrecision, roundedFormatted, denomination, formatted } = value;
  const maxHoverDecimals = 8;
  const minHoverDecimals = 4;
  const fullWithoutDecimals = fullPrecision.split('.')[0];
  const testValue = createBigNumber(fullPrecision);
  const isGreaterThan = testValue.abs().gt(max);
  const isLessThan = testValue.abs().lt(min) && !testValue.eq(ZERO);
  let postfix = isGreaterThan || isLessThan ? String.fromCodePoint(0x2026) : '';
  let frontFacingLabel = isGreaterThan ? fullWithoutDecimals : roundedFormatted;
  const denominationLabel = showDenomination ? `${denomination}` : '';

  let fullValue = fullPrecision;
  if (fixedPrecision) {
    const decimals = fullValue.toString().split('.')[1];
    if (decimals && decimals.length > maxHoverDecimals) {
      const round = formatNumber(fullPrecision, {
        decimals: maxHoverDecimals,
        decimalsRounded: maxHoverDecimals,
      });
      fullValue = round.formatted;
      if (
        fullValue.split('.')[1] &&
        fullValue.split('.')[1].length > maxHoverDecimals
      ) {
        fullValue = round.rounded;
      }
    }

    if (testValue.gte('1000') && fixedPrecision) {
      frontFacingLabel = testValue.toFixed(minHoverDecimals);
    }
  }

  if (fullValue.length === frontFacingLabel.length) {
    postfix = '';
  }

  if (postfix.length && !isGreaterThan) {
    frontFacingLabel = frontFacingLabel.slice(0, -1);
  }

  return {
    fullPrecision: fullValue,
    postfix,
    frontFacingLabel,
    denominationLabel,
  };
}

export const SizableValueLabel = (props: SizableValueLabelProps) => (
  <span
    className={classNames(Styles.SizableValueLabel, {
      [Styles.Large]: props.size === SizeTypes.LARGE,
      [Styles.Small]: props.size === SizeTypes.SMALL,
      [Styles.Highlight]: props.highlight,
    })}
  >
    <ValueLabel
      value={props.value}
      keyId={props.keyId}
      showDenomination={props.showDenomination}
      showEmptyDash={props.showEmptyDash}
    />
  </span>
);

export const ValueLabel = (props: ValueLabelProps) => {
  if (!props.value || props.value === null)
    return props.showEmptyDash ? <span>&#8213;</span> : <span />;

  const expandedValues = formatExpandedValue(
    props.value,
    props.showDenomination
  );

  const {
    fullPrecision,
    postfix,
    frontFacingLabel,
    denominationLabel,
  } = expandedValues;

  return (
    <span
      className={classNames(Styles.ValueLabel, {
        [Styles.DarkDash]: props.value.full === '-',
        [Styles.Alert]: props.alert,
      })}
    >
      <label
        data-tip
        data-for={`valueLabel-${fullPrecision}-${denominationLabel}-${props.keyId}`}
        data-iscapture="true"
      >
        {props.useFull && props.value.full}
        {!props.useFull && `${frontFacingLabel}${postfix}`}
        {!props.useFull && <span>{denominationLabel}</span>}
      </label>
      {postfix.length !== 0 && (
        <ReactTooltip
          id={`valueLabel-${fullPrecision}-${denominationLabel}-${props.keyId}`}
          className={TooltipStyles.Tooltip}
          effect="solid"
          place="top"
          type="light"
          data-event="mouseover"
          data-event-off="blur scroll"
        >
          {props.useFull && props.value.full}
          {!props.useFull && `${fullPrecision} ${denominationLabel}`}
        </ReactTooltip>
      )}
    </span>
  );
};

export class TextLabel extends React.Component<TextLabelProps, TextLabelState> {
  labelRef: any = null;
  state: TextLabelState = {
    scrollWidth: null,
    clientWidth: null,
    isDisabled: true,
  };

  measure() {
    const { clientWidth, scrollWidth } = this.labelRef;

    this.setState({
      scrollWidth,
      clientWidth,
      isDisabled: !(scrollWidth > clientWidth),
    });
  }

  componentDidMount() {
    this.measure();
  }

  componentDidUpdate() {
    this.measure();
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return (
      this.state.scrollWidth !== nextState.scrollWidth ||
      this.state.clientWidth !== nextState.clientWidth ||
      this.props.text !== nextProps.text
    );
  }
  render() {
    const { text, keyId } = this.props;
    const { isDisabled } = this.state;

    return (
      <span className={Styles.TextLabel}>
        <label
          ref={ref => (this.labelRef = ref)}
          data-tip
          data-for={`${keyId}-${text ? text.replace(/\s+/g, '-') : ''}`}
        >
          {text}
        </label>
        {!isDisabled && (
          <ReactTooltip
            id={`${keyId}-${text.replace(/\s+/g, '-')}`}
            className={TooltipStyles.Tooltip}
            effect="solid"
            place="top"
            type="light"
            data-event="mouseover"
            data-event-off="blur scroll"
          >
            {text}
          </ReactTooltip>
        )}
      </span>
    );
  }
}

export class HoverValueLabel extends React.Component<
  ValueLabelProps,
  HoverValueLabelState
> {
  state: HoverValueLabelState = {
    hover: false,
  };
  render() {
    const { value, showDenomination, useFull } = this.props;
    if (!value || value === null) return <span />;

    const expandedValues = formatExpandedValue(
      value,
      showDenomination,
      true,
      '99999'
    );
    const { fullPrecision, postfix, frontFacingLabel } = expandedValues;

    const frontFacingLabelSplit = frontFacingLabel.toString().split('.');
    const firstHalf = frontFacingLabelSplit[0];
    const secondHalf = frontFacingLabelSplit[1];

    const fullPrecisionSplit = fullPrecision.toString().split('.');
    const firstHalfFull = fullPrecisionSplit[0];
    const secondHalfFull = fullPrecisionSplit[1];

    return (
      <span
        className={Styles.HoverValueLabel}
        onMouseEnter={() => {
          this.setState({
            hover: true,
          });
        }}
        onMouseLeave={() => {
          this.setState({
            hover: false,
          });
        }}
      >
        {this.state.hover && postfix.length !== 0 ? (
          <span>
            {useFull && value.full}
            {!useFull && (
              <>
                <span>
                  {firstHalfFull}
                  {secondHalfFull && '.'}
                </span>
                <span>{secondHalfFull}</span>
              </>
            )}
          </span>
        ) : (
          <span>
            {useFull && value.formatted}
            {!useFull && (
              <>
                <span>
                  {firstHalf}
                  {secondHalf && '.'}
                </span>
                <span>
                  {secondHalf} {postfix}
                </span>
              </>
            )}
          </span>
        )}
      </span>
    );
  }
}

export const InvalidLabel = ({
  text,
  keyId,
  openInvalidMarketRulesModal,
  tooltipPositioning,
}: InvalidLabelProps) => {
  const {
    explainerBlockTitle,
    explainerBlockSubtexts,
    useBullets,
  } = EventDetailsContent();

  const openModal = event => {
    event.preventDefault();
    event.stopPropagation();
    openInvalidMarketRulesModal();
  };

  return (
    <span className={Styles.InvalidLabel}>
      {text}
      <label
        data-tip
        data-for={`${keyId}-${text ? text.replace(/\s+/g, '-') : ''}`}
        onClick={event => openModal(event)}
      >
        {QuestionIcon}
      </label>
      <ReactTooltip
        id={`${keyId}-${text.replace(/\s+/g, '-')}`}
        className={classNames(
          TooltipStyles.Tooltip,
          TooltipStyles.TooltipInvalidRules
        )}
        effect="solid"
        place={tooltipPositioning || 'left'}
        type="dark"
        data-event="mouseover"
        data-event-off="blur scroll"
      >
        <ExplainerBlock
          title={explainerBlockTitle}
          subtexts={explainerBlockSubtexts}
          useBullets={useBullets}
        />
      </ReactTooltip>
    </span>
  );
};

export const PropertyLabel = (props: PropertyLabelProps) => (
  <div className={Styles.PropertyLabel}>
    <span>
      {props.label}
      {props.hint && (
        <>
          <label
            className={TooltipStyles.TooltipHint}
            data-tip
            data-for={`tooltip-${props.label.replace(' ', '-')}`}
          >
            {QuestionIcon}
          </label>
          <ReactTooltip
            id={`tooltip-${props.label.replace(' ', '-')}`}
            className={TooltipStyles.Tooltip}
            effect="solid"
            place="right"
            type="light"
          >
            {props.hint}
          </ReactTooltip>
        </>
      )}
    </span>
    <span>{props.value}</span>
  </div>
);

export const LinearPropertyLabel = ({
  highlight,
  highlightAlternateBolded,
  highlightFirst,
  label,
  useValueLabel,
  showDenomination,
  accentValue,
  value,
  useFull,
}: LinearPropertyLabelProps) => (
  <div
    className={classNames(Styles.LinearPropertyLabel, {
      [Styles.Highlight]: highlight,
      [Styles.HighlightAlternateBolded]: highlightAlternateBolded,
      [Styles.HighlightFirst]: highlightFirst,
    })}
  >
    <span>{label}</span>
    <DashlineNormal />
    {useValueLabel ? (
      <ValueLabel
        value={value}
        showDenomination={showDenomination}
        useFull={useFull}
      />
    ) : (
      <span
        className={classNames({
          [Styles.isAccented]: accentValue,
        })}
      >
        {value && value.formatted
          ? `${showDenomination || useFull ? value.full : value.formatted}`
          : value}
      </span>
    )}
    {useValueLabel ? (
      <ValueLabel
        value={value}
        showDenomination={showDenomination}
        useFull={useFull}
      />
    ) : (
      <span
        className={classNames({
          [Styles.isAccented]: accentValue,
        })}
      >
        {value && value.formatted
          ? `${showDenomination || useFull ? value.full : value.formatted}`
          : value}
      </span>
    )}
  </div>
);

export const MarketTypeLabel = ({ marketType }: MarketTypeProps) => {
  if (!marketType) {
    return null;
  }
  const labelTexts = {
    [YES_NO]: 'Yes/No',
    [CATEGORICAL]: 'Categorical',
    [SCALAR]: 'Scalar Market',
  };
  const text = labelTexts[marketType];
  const isScalar = marketType === SCALAR;

  return (
    <span
      className={classNames(Styles.MarketTypeLabel, {
        [Styles.MarketScalarLabel]: isScalar,
      })}
    >
      {text} {isScalar && ScalarIcon}
    </span>
  );
};

export const MarketStatusLabel = (props: MarketStatusProps) => {
  const { reportingState, mini } = props;
  let open = false;
  let resolved = false;
  let reporting = false;
  let text: string;
  switch (reportingState) {
    case REPORTING_STATE.PRE_REPORTING:
      open = true;
      text = constants.MARKET_STATUS_MESSAGES.OPEN;
      break;
    case REPORTING_STATE.AWAITING_FINALIZATION:
    case REPORTING_STATE.FINALIZED:
      resolved = true;
      text = constants.MARKET_STATUS_MESSAGES.RESOLVED;
      break;
    default:
      reporting = true;
      text = constants.MARKET_STATUS_MESSAGES.IN_REPORTING;
      break;
  }

  return (
    <span
      className={classNames(Styles.MarketStatus, {
        [Styles.MarketStatus_mini]: mini,
        [Styles.MarketStatus_open]: open,
        [Styles.MarketStatus_resolved]: resolved,
        [Styles.MarketStatus_reporting]: reporting,
      })}
    >
      {text}
    </span>
  );
};

export const InReportingLabel = (props: InReportingLabelProps) => {
  const { reportingState, disputeInfo } = props;

  const reportingStates = [
    REPORTING_STATE.DESIGNATED_REPORTING,
    REPORTING_STATE.OPEN_REPORTING,
    REPORTING_STATE.AWAITING_NEXT_WINDOW,
    REPORTING_STATE.CROWDSOURCING_DISPUTE,
  ];

  if (!reportingStates.includes(reportingState)) {
    return <MarketStatusLabel {...props} />;
  }

  let reportingExtraText: string | null;
  // const text: string = constants.IN_REPORTING;
  const text = '';
  let customLabel: string | null = null;

  if (reportingState === REPORTING_STATE.DESIGNATED_REPORTING) {
    reportingExtraText = constants.WAITING_ON_REPORTER;
    customLabel = constants.REPORTING_ENDS;
  } else if (reportingState === REPORTING_STATE.OPEN_REPORTING) {
    reportingExtraText = constants.OPEN_REPORTING;
  } else if (disputeInfo.disputePacingOn) {
    reportingExtraText = constants.SLOW_DISPUTE;
  } else if (!disputeInfo.disputePacingOn) {
    reportingExtraText = constants.FAST_DISPUTE;
    customLabel = constants.DISPUTE_ENDS;
  } else {
    reportingExtraText = null;
  }

  return (
    <span
      className={classNames(Styles.MarketStatus, Styles.MarketStatus_reporting)}
    >
      {text}
      {reportingExtraText && (
        <span className={Styles.InReporting_reportingDetails}>
          {/* {DoubleArrows} */}
          {reportingExtraText}
        </span>
      )}
    </span>
  );
};

interface PendingLabelProps {
  status?: string;
}

export const PendingLabel = (props: PendingLabelProps) => (
  <span
    className={classNames(Styles.PendingLabel, {
      [Styles.Failure]: props.status && props.status === TXEventName.Failure,
    })}
    data-tip
    data-for={'processing'}
  >
    {(!props.status ||
      props.status === TXEventName.Pending ||
      props.status === TXEventName.AwaitingSigning) && (
      <>
        <span>
          Processing <ClipLoader size={8} color="#ffffff" />
        </span>
        <ReactTooltip
          id={'processing'}
          className={TooltipStyles.Tooltip}
          effect="solid"
          place="top"
          type="light"
          data-event="mouseover"
          data-event-off="blur scroll"
        >
          You will receive an alert when the transaction has finalized.
        </ReactTooltip>
      </>
    )}
    {props.status && props.status === TXEventName.Failure && (
      <span>Failed</span>
    )}
  </span>
);

export const ConfirmedLabel = () => (
  <span className={Styles.ConfirmedLabel}>Confirmed {CheckCircleIcon}</span>
);

export const MovementIcon = (props: MovementIconProps) => {
  const getIconSizeStyles: Function = (size: SizeTypes): string =>
    classNames(Styles.MovementLabel_Icon, {
      [Styles.MovementLabel_Icon_small]: size == SizeTypes.SMALL,
      [Styles.MovementLabel_Icon_normal]: size == SizeTypes.NORMAL,
      [Styles.MovementLabel_Icon_large]: size == SizeTypes.LARGE,
    });

  const getIconColorStyles: Function = (value: number): string =>
    classNames({
      [Styles.MovementLabel_Icon_positive]: value > 0,
      [Styles.MovementLabel_Icon_negative]: value < 0,
    });

  const iconSize = getIconSizeStyles(props.size);
  const iconColor = getIconColorStyles(props.value);

  return <div className={`${iconSize} ${iconColor}`}>{MarketIcon}</div>;
};

export const MovementText = ({
  value,
  size,
  showPlusMinus,
  showBrackets,
  hideNegative,
  useFull,
  numberValue,
}: MovementTextProps) => {
  const getTextSizeStyle: Function = (sz: SizeTypes): string =>
    classNames(Styles.MovementLabel_Text, {
      [Styles.MovementLabel_Text_small]: sz == SizeTypes.SMALL,
      [Styles.MovementLabel_Text_normal]: sz == SizeTypes.NORMAL,
      [Styles.MovementLabel_Text_large]: sz == SizeTypes.LARGE,
    });
  const getTextColorStyles: Function = (val: number): string =>
    classNames({
      [Styles.MovementLabel_Text_positive]: val > 0,
      [Styles.MovementLabel_Text_negative]: val < 0,
      [Styles.MovementLabel_Text_neutral]: val === 0,
    });

  const textColorStyle = getTextColorStyles(numberValue);
  const textSizeStyle = getTextSizeStyle(size);

  const handlePlusMinus: Function = (label: string): string => {
    if (showPlusMinus) {
      if (numberValue > 0) {
        return '+'.concat(label);
      }
    } else {
      if (numberValue < 0 && hideNegative) {
        return label.replace('-', '');
      }
    }
    return label;
  };

  const addBrackets: Function = (label: string): string => {
    if (showBrackets) {
      return `(${label})`;
    }
    return label;
  };

  const formattedString = addBrackets(
    handlePlusMinus(useFull ? value.full : value.formatted)
  );

  return (
    <div className={`${textColorStyle} ${textSizeStyle}`}>
      {formattedString}
    </div>
  );
};

export const MovementLabel = ({
  value,
  styles,
  size = SizeTypes.NORMAL,
  showBrackets = false,
  showPlusMinus = false,
  showIcon = false,
  hideNegative = false,
  useFull = false,
}: MovementLabelProps) => {
  const numberValue = typeof value === 'number' ? value : value.value;
  return (
    <div
      className={Styles.MovementLabel}
      style={
        showIcon
          ? { ...styles, justifyContent: 'space-between' }
          : { ...styles, justifyContent: 'flex-end' }
      }
    >
      {showIcon && numberValue !== 0 && (
        <MovementIcon value={numberValue} size={size} />
      )}
      {
        <MovementText
          value={value}
          numberValue={numberValue}
          size={size}
          showBrackets={showBrackets}
          showPlusMinus={showPlusMinus}
          useFull={useFull}
          hideNegative={hideNegative}
        />
      }
    </div>
  );
};

export const PillLabel = ({ label, hideOnMobile }: PillLabelProps) => (
  <span
    className={classNames(Styles.PillLabel, {
      [Styles.HideOnMobile]: hideOnMobile,
    })}
  >
    {label}
  </span>
);

export const RepBalance = (props: RepBalanceProps) => (
  <div
    className={classNames(Styles.RepBalance, {
      [Styles.Alternate]: props.alternate,
      [Styles.Larger]: props.larger,
    })}
  >
    <span>{constants.TOTAL_ACCOUNT_VALUE_IN_REP}</span>
    <span>{props.rep}</span>
    <span>rep</span>
  </div>
);

export const PositionTypeLabel = (props: PositionTypeLabelProps) => {
  let type = props.type;
  if (props.pastTense) type = props.type !== SELL ? BOUGHT : SOLD;

  return (
    <span
      className={classNames(Styles.PositionTypeLabel, {
        [Styles.Sell]: props.type === SHORT || props.type === SELL,
        [Styles.Closed]: props.type === CLOSED,
      })}
    >
      {type}
    </span>
  );
};

export const LinearPropertyLabelMovement = (
  props: LinearPropertyLabelPercentMovementProps
) => (
  <span className={Styles.LinearPropertyLabelPercent}>
    <LinearPropertyLabel
      label={props.label}
      value={props.value}
      highlightFirst={props.highlightFirst}
      highlightAlternate
      useFull={props.useFull}
      useValueLabel={props.useValueLabel}
    />
    <MovementLabel
      showIcon={props.showIcon}
      showBrackets={props.showBrackets}
      showPlusMinus={props.showPlusMinus}
      value={props.movementValue}
      useFull={props.useFull}
    />
  </span>
);

export const LinearPropertyLabelTooltip = (
  props: LinearPropertyLabelTooltipProps
) => (
  <span className={Styles.LinearPropertyLabelTooltip}>
    <LinearPropertyLabel label={props.label} value={props.value} />
    <div>
      <label
        className={TooltipStyles.TooltipHint}
        data-tip
        data-for={`tooltip-${props.label}`}
      >
        {HintAlternate}
      </label>
      <ReactTooltip
        id={`tooltip-${props.label}`}
        className={TooltipStyles.Tooltip}
        effect="solid"
        place="top"
        type="light"
        data-event="mouseover"
        data-event-off="blur scroll"
      >
        Information text
      </ReactTooltip>
    </div>
  </span>
);

export const LinearPropertyViewTransaction = (
  props: LinearPropertyLabelViewTransactionProps
) => (
  <div
    className={classNames(
      Styles.LinearPropertyLabel,
      Styles.LinearPropertyViewTransaction
    )}
  >
    <LinearPropertyLabel
      label="Transaction Details"
      value=""
      highlightFirst={props.highlightFirst}
    />
    <ViewTransactionDetailsButton
      light
      transactionHash={props.transactionHash}
    />
  </div>
);

export const WordTrail: React.FC<WordTrailProps> = ({
  items,
  typeLabel,
  children,
}) => (
  <div className={Styles.WordTrail}>
    {children}
    {items.map(({ label, onClick }, index) => (
      <button
        key={`${label}-${index}`}
        data-testid={`${typeLabel}-${index}`}
        className={Styles.WordTrailButton}
        onClick={e => onClick()}
      >
        <span>{label}</span>
        <span>{index !== items.length - 1 && '/'}</span>
      </button>
    ))}
  </div>
);

WordTrail.defaultProps = {
  items: [],
  typeLabel: 'label-type',
};

export const CategoryTagTrail = ({ categories }: CategoryTagTrailProps) => (
  <div className={Styles.CategoryTagTrail}>
    <WordTrail items={categories} typeLabel="Category" />
  </div>
);

interface BulkTxLabelProps {
  count: number;
  needsApproval: boolean;
  buttonName: string;
  className?: string;
}
export const BulkTxLabel = ({
  count,
  needsApproval,
  buttonName,
  className,
}: BulkTxLabelProps) =>
  count > 1 || needsApproval ? (
    <div className={classNames(Styles.BulkTxLabel, className)}>
      <DismissableNotice
        show={true}
        description=""
        title={`${buttonName} requires ${count} transaction${
          count > 1 ? `s` : ``
        }${needsApproval ? `, and 1 approval` : ''}`}
        buttonType={DISMISSABLE_NOTICE_BUTTON_TYPES.CLOSE}
      />
    </div>
  ) : null;

export const ValueDenomination: React.FC<ValueDenominationProps> = ({
  className,
  prefix,
  hidePrefix,
  formatted,
  fullPrecision,
  valueClassname,
  denomination,
  hideDenomination,
  postfix,
  hidePostfix,
  value,
}) => (
  <span className={Styles[className]}>
    {prefix && !hidePrefix && <span className={Styles.prefix}>{prefix}</span>}
    {formatted && fullPrecision && (
      <span
        data-tip={fullPrecision}
        data-event="click focus"
        className={`value_${valueClassname}`}
      >
        {formatted}
      </span>
    )}
    {formatted && !fullPrecision && (
      <span className={`value_${valueClassname}`}>{formatted}</span>
    )}
    {denomination && !hideDenomination && (
      <span className={Styles.denomination}>{denomination}</span>
    )}
    {postfix && !hidePostfix && (
      <span className={Styles.postfix}>{postfix}</span>
    )}
    {!value && value !== 0 && !formatted && formatted !== '0' && (
      <span>&mdash;</span>
    ) // null/undefined state handler
    }
  </span>
);

ValueDenomination.defaultProps = {
  className: null,
  valueClassname: null,
  prefix: null,
  postfix: null,
  value: null,
  formatted: null,
  fullPrecision: null,
  denomination: null,
  hidePrefix: false,
  hidePostfix: false,
  hideDenomination: false,
};

export const MarketStateLabel = (props: MarketStateLabelProps) => (
  <div
    onClick={() => props.handleClick()}
    className={classNames(Styles.MarketLabel, {
      [Styles.selected]: props.selected,
      [Styles.loading]: props.loading,
      [Styles.open]: props.marketType === constants.MARKET_OPEN,
      [Styles.inReporting]: props.marketType === constants.MARKET_REPORTING,
      [Styles.resolved]: props.marketType === constants.MARKET_CLOSED,
    })}
  >
    <div>{props.label}</div>
    {props.selected && !props.loading && <div>({props.count})</div>}
    {props.loading && props.selected && (
      <div>
        <span>{LoadingEllipse}</span>
      </div>
    )}
  </div>
);

interface DiscordLinkProps {
  label?: string;
}

export const DiscordLink = (props: DiscordLinkProps) => (
  <div className={Styles.discordLink}>
    {props.label}
    <a href={DISCORD_LINK} target="_blank">
      Discord
    </a>
  </div>
);

export const AddFundsHelp = (props) => (
  <ol>
    <li>Add ETH to your {props.walletType} account address. {props.walletType === ACCOUNT_TYPES.WEB3WALLET ? '' : `${props.walletType} are our secure account and payment partners. ${props.walletType} will enable you to process the transaction fee without requiring Dai.`} {props.walletType === ACCOUNT_TYPES.WEB3WALLET ? null : <span onClick={() => props.showAddFundsModal()}>Add ETH to your {props.walletType} account address</span>}</li>
    <li>After you have sent the ETH to your {props.walletType} account address you can then return and make the transaction.</li>
  </ol>
);
