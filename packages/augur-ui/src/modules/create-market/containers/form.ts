import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { submitNewMarket } from "modules/markets/actions/submit-new-market";
import {
  addOrderToNewMarket,
  removeOrderFromNewMarket,
  updateNewMarket,
  clearNewMarket
} from "modules/markets/actions/update-new-market";
import Form from "modules/create-market/components/form";
import getValue from "utils/get-value";
import { addDraft, updateDraft } from "modules/create-market/actions/update-drafts";

const mapStateToProps = state => ({
  newMarket: state.newMarket,
  currentTimestamp: getValue(state, "blockchain.currentAugurTimestamp"),
  address: getValue(state, "loginAccount.address"),
  drafts: state.drafts,
});

const mapDispatchToProps = dispatch => ({
  updateNewMarket: data => dispatch(updateNewMarket(data)),
  submitNewMarket: (data, history, cb) =>
    dispatch(submitNewMarket(data, history, cb)),
  addDraft: (key, data) => dispatch(addDraft(key, data)),
  clearNewMarket: () => dispatch(clearNewMarket()),
  updateDraft: (key, data) => dispatch(updateDraft(key, data)),
});

const FormContainer = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Form)
);

export default FormContainer;