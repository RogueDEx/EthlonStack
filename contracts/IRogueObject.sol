pragma solidity ^0.5.15;

interface IRogueObject {
    function setTimes(uint32 _inception, uint32 _expiration) external;

    function getOrderRow(uint256 _row)
       external  view
       returns (address, address, uint96, uint96, uint256);

    function updateRow(uint32 _rowNum, int256 _haves, int256 _wants,
            uint96 _askPriceN, uint96 _askPriceD, uint256 _wantsTotal)
        external;

    function deleteRow(uint32 _rowNum) external;

    function approveAsAlice(address _a, uint256 _aliceRow, address _b, uint256 _bobRow)
        external
        returns (uint256[9] memory);

    function approveAsBob(address _a, uint256 _aliceRow, address _b, uint256 _bobRow)
        external
        returns (uint256[9] memory);

    function executeTrade(uint256[9] calldata r) external;

    function verifyTrade(uint256[9] calldata r) external;

    function disassociate() external returns (bool);
}

