from ethereum.tools import tester
from ethereum.tools.tester import TransactionFailed
from utils import longToHexString, stringToBytes
from pytest import fixture, raises

def test_universe_creation(localFixture, mockReputationToken, mockReputationTokenFactory, mockUniverse, mockUniverseFactory):
    universe = localFixture.upload('../source/contracts/reporting/Universe.sol', 'universe')

    with raises(TransactionFailed, message="reputation token can not be address 0"):
        universe.initialize(mockUniverse.address, stringToBytes("5"))    

    mockReputationTokenFactory.setCreateReputationTokenValue(mockReputationToken.address)
    universe.setController(localFixture.contracts['Controller'].address)
    assert universe.initialize(mockUniverse.address, stringToBytes("5"))    
    assert universe.getReputationToken() == mockReputationToken.address
    assert universe.getParentUniverse() == mockUniverse.address
    assert universe.getParentPayoutDistributionHash() == stringToBytes("5")
    assert universe.getForkingMarket() == longToHexString(0)
    assert universe.getForkEndTime() == 0
    assert universe.getTypeName() == stringToBytes('Universe')
    assert universe.getForkEndTime() == 0
    assert universe.getChildUniverse("5") == longToHexString(0)

    # child universe
    mockUniverseFactory.setCreateUniverseUniverseValue(mockUniverse.address)
    assert universe.getOrCreateChildUniverse(stringToBytes("101")) == mockUniverse.address
    assert mockUniverseFactory.getCreateUniverseParentUniverseValue() == universe.address
    assert mockUniverseFactory.getCreateUniverseParentPayoutDistributionHashValue() == stringToBytes("101")
    assert universe.getChildUniverse(stringToBytes("101")) == mockUniverse.address
    mockUniverse.setParentPayoutDistributionHash(stringToBytes("101"))
    assert universe.isParentOf(mockUniverse.address)
    strangerUniverse = localFixture.upload('../source/contracts/reporting/Universe.sol', 'strangerUniverse')
    assert universe.isParentOf(strangerUniverse.address) == False

def test_universe_fork_market(localFixture, populatedUniverse, mockMarket, mockReportingWindow, chain, mockReportingWindowFactory):

    with raises(TransactionFailed, message="must be called from market"):
        populatedUniverse.fork()
    
    with raises(TransactionFailed, message="forking market has to be in universe"):
        mockMarket.callForkOnUniverse(populatedUniverse.address)

    timestamp = chain.head_state.timestamp
    mockReportingWindowFactory.setCreateReportingWindowValue(mockReportingWindow.address)
    reportingWindowId = populatedUniverse.getReportingWindowByTimestamp(timestamp)
    mockReportingWindow.setStartTime(timestamp)

    mockReportingWindow.setIsContainerForMarket(True)
    mockMarket.setReportingWindow(mockReportingWindow.address)
    assert populatedUniverse.getForkingMarket() == longToHexString(0)
    assert populatedUniverse.isContainerForMarket(mockMarket.address)
    
    assert mockMarket.callForkOnUniverse(populatedUniverse.address)
    assert populatedUniverse.getForkingMarket() == mockMarket.address
    assert populatedUniverse.getForkEndTime() == timestamp + localFixture.contracts['Constants'].FORK_DURATION_SECONDS()

    assert populatedUniverse.getReportingWindowForForkEndTime() == mockReportingWindow.address

    with raises(TransactionFailed, message="forking market is already set"):
        mockMarket.callForkOnUniverse()


def test_get_reporting_window(localFixture, populatedUniverse, chain):
    constants = localFixture.contracts['Constants']
    timestamp = chain.head_state.timestamp
    duration =  constants.REPORTING_DURATION_SECONDS()
    dispute_duration = constants.REPORTING_DISPUTE_DURATION_SECONDS()
    total_dispute_duration = duration + dispute_duration
    reportingPeriodDurationForTimestamp = timestamp / total_dispute_duration

    assert populatedUniverse.getReportingWindowId(timestamp) == reportingPeriodDurationForTimestamp
    assert populatedUniverse.getReportingPeriodDurationInSeconds() == total_dispute_duration

    # reporting window not stored internally, only read-only method
    assert populatedUniverse.getReportingWindow(reportingPeriodDurationForTimestamp) == longToHexString(0)
    report_window = populatedUniverse.getReportingWindowByTimestamp(timestamp)

    # Now reporting window is in internal collection
    assert populatedUniverse.getReportingWindow(reportingPeriodDurationForTimestamp) == report_window

    # Make up end timestamp for testing internal calculations
    end_timestamp = chain.head_state.timestamp + 1
    end_report_window_des = populatedUniverse.getReportingWindowByMarketEndTime(end_timestamp)

    # Test getting same calculated end reporting window
    end_timestamp_des_test = end_timestamp + constants.DESIGNATED_REPORTING_DURATION_SECONDS() + constants.DESIGNATED_REPORTING_DISPUTE_DURATION_SECONDS() + 1 + total_dispute_duration
    assert populatedUniverse.getReportingWindowByTimestamp(end_timestamp_des_test) == end_report_window_des
    assert populatedUniverse.getPreviousReportingWindow() == populatedUniverse.getReportingWindowByTimestamp(chain.head_state.timestamp - total_dispute_duration)
    assert populatedUniverse.getCurrentReportingWindow() == populatedUniverse.getReportingWindowByTimestamp(chain.head_state.timestamp)
    assert populatedUniverse.getNextReportingWindow() == populatedUniverse.getReportingWindowByTimestamp(chain.head_state.timestamp + total_dispute_duration)

def test_universe_contains(localFixture, populatedUniverse, mockMarket, mockStakeToken, chain, mockReportingWindow, mockDisputeBondToken, mockShareToken, mockReportingWindowFactory):
    mockReportingWindow.setStartTime(0)
    assert populatedUniverse.isContainerForReportingWindow(mockReportingWindow.address) == False
    assert populatedUniverse.isContainerForStakeToken(mockStakeToken.address) == False
    assert populatedUniverse.isContainerForMarket(mockMarket.address) == False
    assert populatedUniverse.isContainerForShareToken(mockShareToken.address) == False
    assert populatedUniverse.isContainerForDisputeBondToken(mockDisputeBondToken.address) == False

    timestamp = chain.head_state.timestamp
    mockReportingWindowFactory.setCreateReportingWindowValue(mockReportingWindow.address)
    reportingWindowId = populatedUniverse.getReportingWindowByTimestamp(timestamp)
    mockReportingWindow.setStartTime(timestamp)

    mockReportingWindow.setIsContainerForMarket(False)
    mockMarket.setIsContainerForStakeToken(False)
    mockMarket.setIsContainerForShareToken(False)
    mockMarket.setIsContainerForDisputeBondToken(False)
    
    assert populatedUniverse.isContainerForStakeToken(mockStakeToken.address) == False
    assert populatedUniverse.isContainerForMarket(mockMarket.address) == False
    assert populatedUniverse.isContainerForShareToken(mockShareToken.address) == False
    assert populatedUniverse.isContainerForDisputeBondToken(mockDisputeBondToken.address) == False

    mockReportingWindow.setIsContainerForMarket(True)
    mockMarket.setIsContainerForStakeToken(True)
    mockMarket.setIsContainerForShareToken(True)
    mockMarket.setIsContainerForDisputeBondToken(True)
    mockMarket.setReportingWindow(mockReportingWindow.address)
    mockStakeToken.setMarket(mockMarket.address)
    mockShareToken.setMarket(mockMarket.address)
    mockDisputeBondToken.setMarket(mockMarket.address)

    assert populatedUniverse.isContainerForReportingWindow(mockReportingWindow.address) == True
    assert populatedUniverse.isContainerForMarket(mockMarket.address) == True
    assert populatedUniverse.isContainerForStakeToken(mockStakeToken.address) == True
    assert populatedUniverse.isContainerForShareToken(mockShareToken.address) == True
    assert populatedUniverse.isContainerForDisputeBondToken(mockDisputeBondToken.address) == True

def test_universe_extra_bond_payout(localFixture, populatedUniverse, mockUniverse, mockDisputeBondToken, mockReputationToken ):
    with raises(TransactionFailed, message="needs to be called from reputation token"):
        populatedUniverse.increaseRepAvailableForExtraBondPayouts(100)

    assert populatedUniverse.getRepAvailableForExtraBondPayouts() == 0
    assert mockReputationToken.callIncreaseRepAvailableForExtraBondPayouts(populatedUniverse.address, 100)
    assert populatedUniverse.getRepAvailableForExtraBondPayouts() == 100

    mockUniverse.setIsContainerForDisputeBondToken(False)
    with raises(TransactionFailed, message="dispute bond needs to be in parent universe"):
        mockDisputeBondToken.callDecreaseRepAvailableForExtraBondPayouts(populatedUniverse.address, 50)

    mockUniverse.setIsContainerForDisputeBondToken(True)
    assert mockDisputeBondToken.callDecreaseRepAvailableForExtraBondPayouts(populatedUniverse.address, 50)
    assert populatedUniverse.getRepAvailableForExtraBondPayouts() == 50

def test_universe_dispute_bond_remaining_to_be_paid(localFixture, chain, mockMarket, populatedUniverse, mockReputationToken, mockUniverse, mockDisputeBondToken, mockReportingWindow, mockReportingWindowFactory):
    assert populatedUniverse.getExtraDisputeBondRemainingToBePaidOut() == 0

    with raises(TransactionFailed, message="market needs to be contained in universe"):
        mockMarket.callIncreaseExtraDisputeBondRemainingToBePaidOut(100)

    timestamp = chain.head_state.timestamp
    mockReportingWindowFactory.setCreateReportingWindowValue(mockReportingWindow.address)
    reportingWindowId = populatedUniverse.getReportingWindowByTimestamp(timestamp)
    mockReportingWindow.setStartTime(timestamp)
    mockReportingWindow.setIsContainerForMarket(True)
    mockMarket.setIsContainerForDisputeBondToken(True)
    mockMarket.setReportingWindow(mockReportingWindow.address)
    
    assert populatedUniverse.isContainerForReportingWindow(mockReportingWindow.address)
    assert populatedUniverse.isContainerForMarket(mockMarket.address)
    assert mockMarket.callIncreaseExtraDisputeBondRemainingToBePaidOut(populatedUniverse.address, 100)
    assert populatedUniverse.getExtraDisputeBondRemainingToBePaidOut() == 100

    with raises(TransactionFailed, message="dispute bond needs to be contained in universe"):
        mockDisputeBondToken.callDecreaseExtraDisputeBondRemainingToBePaidOut(populatedUniverse.address, 50)

    mockDisputeBondToken.setMarket(mockMarket.address)
    assert mockDisputeBondToken.callDecreaseExtraDisputeBondRemainingToBePaidOut(populatedUniverse.address, 50)
    assert populatedUniverse.getExtraDisputeBondRemainingToBePaidOut() == 50

def test_open_interest(populatedUniverse):
    assert populatedUniverse.getOpenInterestInAttoEth() == 0
    populatedUniverse.incrementOpenInterest(10)
    assert populatedUniverse.getOpenInterestInAttoEth() == 10
    populatedUniverse.decrementOpenInterest(5)
    assert populatedUniverse.getOpenInterestInAttoEth() == 5

def test_universe_rep_price_oracle(localFixture, populatedUniverse):
    # mock out RepPriceOracle

@fixture
def localSnapshot(fixture, augurInitializedSnapshot):
    fixture.resetToSnapshot(augurInitializedSnapshot)
    controller = fixture.contracts['Controller']
    fixture.uploadAndAddToController("solidity_test_helpers/Constants.sol")
    fixture.uploadAndAddToController('solidity_test_helpers/MockShareToken.sol')
    fixture.uploadAndAddToController('solidity_test_helpers/MockStakeToken.sol')
    fixture.uploadAndAddToController('solidity_test_helpers/MockDisputeBondToken.sol')
    fixture.uploadAndAddToController('solidity_test_helpers/MockMarket.sol')
    fixture.uploadAndAddToController('solidity_test_helpers/MockUniverse.sol')
    fixture.uploadAndAddToController('solidity_test_helpers/MockReportingWindow.sol')    
    fixture.uploadAndAddToController('solidity_test_helpers/MockReputationToken.sol')    
    mockReputationTokenFactory = fixture.upload('solidity_test_helpers/MockReputationTokenFactory.sol')
    mockReportingWindowFactory = fixture.upload('solidity_test_helpers/MockReportingWindowFactory.sol')
    mockUniverseFactory = fixture.upload('solidity_test_helpers/MockUniverseFactory.sol')
    controller.setValue(stringToBytes('ReputationTokenFactory'), mockReputationTokenFactory.address)
    controller.setValue(stringToBytes('ReportingWindowFactory'), mockReportingWindowFactory.address)
    controller.setValue(stringToBytes('UniverseFactory'), mockUniverseFactory.address)
    return fixture.createSnapshot()

@fixture
def localFixture(fixture, localSnapshot):
    fixture.resetToSnapshot(localSnapshot)
    return fixture

@fixture
def chain(localFixture):
    return localFixture.chain

@fixture
def mockReportingWindow(localFixture):
    return localFixture.contracts['MockReportingWindow']

@fixture
def mockReputationToken(localFixture):
    return localFixture.contracts['MockReputationToken']

@fixture
def mockReputationTokenFactory(localFixture):
    return localFixture.contracts['MockReputationTokenFactory']

@fixture
def mockReportingWindowFactory(localFixture):
    return localFixture.contracts['MockReportingWindowFactory']

@fixture
def mockUniverseFactory(localFixture):
    return localFixture.contracts['MockUniverseFactory']

@fixture
def mockUniverse(localFixture):
    return localFixture.contracts['MockUniverse']

@fixture
def mockMarket(localFixture):
    return localFixture.contracts['MockMarket']

@fixture
def mockDisputeBondToken(localFixture):
    return localFixture.contracts['MockDisputeBondToken']

@fixture
def mockStakeToken(localFixture):
    return localFixture.contracts['MockStakeToken']

@fixture
def mockShareToken(localFixture):
    return localFixture.contracts['MockShareToken']

@fixture
def populatedUniverse(localFixture, mockReputationTokenFactory, mockReputationToken, mockUniverse):
    universe = localFixture.upload('../source/contracts/reporting/Universe.sol', 'universe')
    mockReputationTokenFactory.setCreateReputationTokenValue(mockReputationToken.address)
    universe.setController(localFixture.contracts['Controller'].address)
    assert universe.initialize(mockUniverse.address, stringToBytes("5"))    
    return universe
