// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/IUlpManager.sol";
import "../access/Governable.sol";

contract RewardRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;

    address public unity;
    address public esUnity;
    address public bnUnity;

    address public ulp; // Unity Liquidity Provider token

    address public stakedUnityTracker;
    address public bonusUnityTracker;
    address public feeUnityTracker;

    address public stakedUlpTracker;
    address public feeUlpTracker;

    address public ulpManager;

    event StakeUnity(address account, uint256 amount);
    event UnstakeUnity(address account, uint256 amount);

    event StakeUlp(address account, uint256 amount);
    event UnstakeUlp(address account, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    function initialize(
        address _weth,
        address _unity,
        address _esUnity,
        address _bnUnity,
        address _ulp,
        address _stakedUnityTracker,
        address _bonusUnityTracker,
        address _feeUnityTracker,
        address _feeUlpTracker,
        address _stakedUlpTracker,
        address _ulpManager
    ) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = _weth;

        unity = _unity;
        esUnity = _esUnity;
        bnUnity = _bnUnity;

        ulp = _ulp;

        stakedUnityTracker = _stakedUnityTracker;
        bonusUnityTracker = _bonusUnityTracker;
        feeUnityTracker = _feeUnityTracker;

        feeUlpTracker = _feeUlpTracker;
        stakedUlpTracker = _stakedUlpTracker;

        ulpManager = _ulpManager;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    function batchStakeUnityForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _unity = unity;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeUnity(msg.sender, _accounts[i], _unity, _amounts[i]);
        }
    }

    function stakeUnityForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeUnity(msg.sender, _account, unity, _amount);
    }

    function stakeUnity(uint256 _amount) external nonReentrant {
        _stakeUnity(msg.sender, msg.sender, unity, _amount);
    }

    function stakeEsUnity(uint256 _amount) external nonReentrant {
        _stakeUnity(msg.sender, msg.sender, esUnity, _amount);
    }

    function unstakeUnity(uint256 _amount) external nonReentrant {
        _unstakeUnity(msg.sender, unity, _amount);
    }

    function unstakeEsUnity(uint256 _amount) external nonReentrant {
        _unstakeUnity(msg.sender, esUnity, _amount);
    }

    function mintAndStakeUlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minUlp) external nonReentrant returns (uint256) {
        require(_amount > 0, "RewardRouter: invalid _amount");

        address account = msg.sender;
        uint256 ulpAmount = IUlpManager(ulpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minUlp);
        IRewardTracker(feeUlpTracker).stakeForAccount(account, account, ulp, ulpAmount);
        IRewardTracker(stakedUlpTracker).stakeForAccount(account, account, feeUlpTracker, ulpAmount);

        emit StakeUlp(account, ulpAmount);

        return ulpAmount;
    }

    function mintAndStakeUlpETH(uint256 _minUsdg, uint256 _minUlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "RewardRouter: invalid msg.value");

        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(ulpManager, msg.value);

        address account = msg.sender;
        uint256 ulpAmount = IUlpManager(ulpManager).addLiquidityForAccount(address(this), account, weth, msg.value, _minUsdg, _minUlp);

        IRewardTracker(feeUlpTracker).stakeForAccount(account, account, ulp, ulpAmount);
        IRewardTracker(stakedUlpTracker).stakeForAccount(account, account, feeUlpTracker, ulpAmount);

        emit StakeUlp(account, ulpAmount);

        return ulpAmount;
    }

    function unstakeAndRedeemUlp(address _tokenOut, uint256 _ulpAmount, uint256 _minOut, address _receiver) external nonReentrant returns (uint256) {
        require(_ulpAmount > 0, "RewardRouter: invalid _ulpAmount");

        address account = msg.sender;
        IRewardTracker(stakedUlpTracker).unstakeForAccount(account, feeUlpTracker, _ulpAmount, account);
        IRewardTracker(feeUlpTracker).unstakeForAccount(account, ulp, _ulpAmount, account);
        uint256 amountOut = IUlpManager(ulpManager).removeLiquidityForAccount(account, _tokenOut, _ulpAmount, _minOut, _receiver);

        emit UnstakeUlp(account, _ulpAmount);

        return amountOut;
    }

    function unstakeAndRedeemUlpETH(uint256 _ulpAmount, uint256 _minOut, address payable _receiver) external nonReentrant returns (uint256) {
        require(_ulpAmount > 0, "RewardRouter: invalid _ulpAmount");

        address account = msg.sender;
        IRewardTracker(stakedUlpTracker).unstakeForAccount(account, feeUlpTracker, _ulpAmount, account);
        IRewardTracker(feeUlpTracker).unstakeForAccount(account, ulp, _ulpAmount, account);
        uint256 amountOut = IUlpManager(ulpManager).removeLiquidityForAccount(account, weth, _ulpAmount, _minOut, address(this));

        IWETH(weth).withdraw(amountOut);

        _receiver.sendValue(amountOut);

        emit UnstakeUlp(account, _ulpAmount);

        return amountOut;
    }

    function claim() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeUnityTracker).claimForAccount(account, account);
        IRewardTracker(feeUlpTracker).claimForAccount(account, account);

        IRewardTracker(stakedUnityTracker).claimForAccount(account, account);
        IRewardTracker(stakedUlpTracker).claimForAccount(account, account);
    }

    function claimEsUnity() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedUnityTracker).claimForAccount(account, account);
        IRewardTracker(stakedUlpTracker).claimForAccount(account, account);
    }

    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeUnityTracker).claimForAccount(account, account);
        IRewardTracker(feeUlpTracker).claimForAccount(account, account);
    }

    function compound() external nonReentrant {
        _compound(msg.sender);
    }

    function compoundForAccount(address _account) external nonReentrant onlyGov {
        _compound(_account);
    }

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
    }

    function _compound(address _account) private {
        _compoundUnity(_account);
        _compoundUlp(_account);
    }

    function _compoundUnity(address _account) private {
        uint256 esUnityAmount = IRewardTracker(stakedUnityTracker).claimForAccount(_account, _account);
        if (esUnityAmount > 0) {
            _stakeUnity(_account, _account, esUnity, esUnityAmount);
        }

        uint256 bnUnityAmount = IRewardTracker(bonusUnityTracker).claimForAccount(_account, _account);
        if (bnUnityAmount > 0) {
            IRewardTracker(feeUnityTracker).stakeForAccount(_account, _account, bnUnity, bnUnityAmount);
        }
    }

    function _compoundUlp(address _account) private {
        uint256 esUnityAmount = IRewardTracker(stakedUlpTracker).claimForAccount(_account, _account);
        if (esUnityAmount > 0) {
            _stakeUnity(_account, _account, esUnity, esUnityAmount);
        }
    }

    function _stakeUnity(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedUnityTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusUnityTracker).stakeForAccount(_account, _account, stakedUnityTracker, _amount);
        IRewardTracker(feeUnityTracker).stakeForAccount(_account, _account, bonusUnityTracker, _amount);

        emit StakeUnity(_account, _amount);
    }

    function _unstakeUnity(address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedUnityTracker).stakedAmounts(_account);

        IRewardTracker(feeUnityTracker).unstakeForAccount(_account, bonusUnityTracker, _amount, _account);
        IRewardTracker(bonusUnityTracker).unstakeForAccount(_account, stakedUnityTracker, _amount, _account);
        IRewardTracker(stakedUnityTracker).unstakeForAccount(_account, _token, _amount, _account);

        uint256 bnUnityAmount = IRewardTracker(bonusUnityTracker).claimForAccount(_account, _account);
        if (bnUnityAmount > 0) {
            IRewardTracker(feeUnityTracker).stakeForAccount(_account, _account, bnUnity, bnUnityAmount);
        }

        uint256 stakedBnUnity = IRewardTracker(feeUnityTracker).depositBalances(_account, bnUnity);
        if (stakedBnUnity > 0) {
            uint256 reductionAmount = stakedBnUnity.mul(_amount).div(balance);
            IRewardTracker(feeUnityTracker).unstakeForAccount(_account, bnUnity, reductionAmount, _account);
            IMintable(bnUnity).burn(_account, reductionAmount);
        }

        emit UnstakeUnity(_account, _amount);
    }
}
