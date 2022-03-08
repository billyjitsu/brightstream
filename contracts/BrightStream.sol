// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import {
    ISuperfluid, 
    ISuperToken, 
    ISuperApp, 
    ISuperAgreement, 
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import {
    ERC721
} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract BrightIDStream is ERC721, SuperAppBase { 

    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token
    address private _receiver;

    //myNFT adjustments:
    string public baseExtension = ".json";

    constructor (
    address owner,
    string memory _name,
    string memory _symbol,
    ISuperfluid host,
    IConstantFlowAgreementV1 cfa,
    ISuperToken acceptedToken,
    address receiver
  )
    ERC721 ( _name, _symbol )
      {
        
      assert(address(host) != address(0));
      assert(address(cfa) != address(0));
      assert(address(acceptedToken) != address(0));
      assert(address(receiver) != address(0));
      //assert(!_host.isApp(ISuperApp(receiver)));

      _host = host;
      _cfa = cfa;
      _acceptedToken = acceptedToken;
      _receiver = receiver;

      uint256 configWord =
            SuperAppDefinitions.APP_LEVEL_FINAL |
            // change from 'before agreement stuff to after agreement
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

      _host.registerApp(configWord);

      _mint(owner, 1);
      _setBaseURI("ipfs://QmVNfVLy7BXAjj1MPvjTDTgHW7zwhoHjg2MWtMUt6nNfZs/1.json");
  }

    /**************************************************************************
     * Redirect Logic
     *************************************************************************/

    function currentReceiver()
        external
        view
        returns (
            uint256 startTime,
            address receiver,
            int96 flowRate
        )
    {
        if (_receiver != address(0)) {
            (startTime, flowRate, , ) = _cfa.getFlow(
                _acceptedToken,
                address(this),
                _receiver
            );
            receiver = _receiver;
        }
    }

    event ReceiverChanged(address receiver); 

    /// @dev If a new stream is opened, or an existing one is opened
    function _updateOutflow(bytes calldata ctx)
        private
        returns (bytes memory newCtx)
    {
        newCtx = ctx;
        // @dev This will give me the new flowRate, as it is called in after callbacks
        int96 netFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));
        (, int96 outFlowRate, , ) = _cfa.getFlow(
            _acceptedToken,
            address(this),
            _receiver
        ); // CHECK: unclear what happens if flow doesn't exist.
        int96 inFlowRate = netFlowRate + outFlowRate;

        //look into this
        if (inFlowRate < 0 ) {
          inFlowRate = inFlowRate * -1; // Fixes issue when inFlowRate is negative
        } 

        // @dev If inFlowRate === 0, then delete existing flow.
        if (inFlowRate == int96(0)) {
            // @dev if inFlowRate is zero, delete outflow.
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.deleteFlow.selector,
                    _acceptedToken,
                    address(this),
                    _receiver,
                    new bytes(0) // placeholder
                ),
                "0x",
                newCtx
            );
        } else if (outFlowRate != int96(0)) {
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.updateFlow.selector,
                    _acceptedToken,
                    _receiver,
                    inFlowRate,
                    new bytes(0) // placeholder
                ),
                "0x",
                newCtx
            );
        } else {
            // @dev If there is no existing outflow, then create new flow to equal inflow
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.createFlow.selector,
                    _acceptedToken,
                    _receiver,
                    inFlowRate,
                    new bytes(0) // placeholder
                ),
                "0x",
                newCtx
            );
        }
    }

    // @dev Change the Receiver of the total flow
    function _changeReceiver(address newReceiver) internal {
        require(newReceiver != address(0), "New receiver is zero address");
        // @dev because our app is registered as final, we can't take downstream apps
        require(
            !_host.isApp(ISuperApp(newReceiver)),
            "New receiver can not be a superApp"
        );
        if (newReceiver == _receiver) return;
        // @dev delete flow to old receiver
        (, int96 outFlowRate, , ) = _cfa.getFlow(
            _acceptedToken,
            address(this),
            _receiver
        ); //CHECK: unclear what happens if flow doesn't exist.
        if (outFlowRate > 0) {
            _host.callAgreement(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.deleteFlow.selector,
                    _acceptedToken,
                    address(this),
                    _receiver,
                    new bytes(0)
                ),
                "0x"
            );
            // @dev create flow to new receiver
            _host.callAgreement(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.createFlow.selector,
                    _acceptedToken,
                    newReceiver,
                    _cfa.getNetFlow(_acceptedToken, address(this)),
                    new bytes(0)
                ),
                "0x"
            );
        }
        // @dev set global receiver to new receiver
        _receiver = newReceiver;

        emit ReceiverChanged(_receiver);
    }

    /**************************************************************************
     * SuperApp callbacks
     *************************************************************************/

    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, // _cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        _setBaseURI("ipfs://QmZ6WWpAaC7No9688NRRp2AagyiZevUReD4AvyJP1X6C1Z/1.json");
        return _updateOutflow(_ctx);
    }

    function afterAgreementUpdated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, //_agreementId,
        bytes calldata agreementData,
        bytes calldata, //_cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        return _updateOutflow(_ctx);
    }

    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, //_agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, //_cbdata,
        bytes calldata _ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isSameToken(_superToken) || !_isCFAv1(_agreementClass))
            return _ctx;
            //set token back to non streaming
            _setBaseURI("ipfs://QmVNfVLy7BXAjj1MPvjTDTgHW7zwhoHjg2MWtMUt6nNfZs/1.json");
        return _updateOutflow(_ctx);
    }

    function _isSameToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == address(_acceptedToken);
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return
            ISuperAgreement(agreementClass).agreementType() ==
            keccak256(
                "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
            );
    }

    modifier onlyHost() {
        require(
            msg.sender == address(_host),
            "RedirectAll: support only one host"
        );
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isSameToken(superToken), "RedirectAll: not accepted token");
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }

    // modifier to stock anybody calling the URI functions Ownable not used
    modifier onlyTheOwner() {
        require(msg.sender == ownerOf(1), "Not the owner of Token");
        _;
    }

    //add in ERC721 functions
     //no modifiers to secure this yet - anybody can call
    function changeURI(string memory _tokenURI) public onlyTheOwner {
        _setBaseURI(_tokenURI);
    }

    function destroyNFT(uint256 _tokenId) public onlyTheOwner {
        _burn(_tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

    string memory currentBaseURI = baseURI();
    return bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI))
        : "";
    }

    //now I will insert a nice little hook in the _transfer, including the RedirectAll function I need
  function _beforeTokenTransfer(
    address /*from*/,
    address to,
    uint256 /*tokenId*/
  ) internal override {
      _changeReceiver(to);
  }


}