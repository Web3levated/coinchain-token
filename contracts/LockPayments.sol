// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LockPayments is Ownable{
     
    enum State { Pending, Completed, Released, Reverted }
      
    struct Order {
        uint256 orderId;
        address manager;
        uint256 dueDate;
        address paymentToken;
        uint256 amount;
        State state;
        uint256 createdAt;
        uint256 completedAt;
        uint256 releasedAt;
     }
    
    uint256 private totalOrders=0;

    mapping(uint256 => Order) orders;

    modifier condition(bool _condition, string memory message) {
        require(_condition, message);
        _;
    }

    event OrderCreated(
        uint256 orderId
  );

    event OrderCompleted(uint256 orderId,address indexed caller);
    event OrderReverted(uint256 orderId,address indexed caller);
    event OrderCompletedAndReleased(uint256 orderId,address indexed caller);

    function createAndDeposit(address managerAddress, uint256 dueDateTimestamp, address _paymentToken, uint256 _amount) 
        public 
        condition(managerAddress != _msgSender(), "Error: check manager address")
        condition(dueDateTimestamp > block.timestamp, "Error: Invalid Due date")
        condition(_amount > 0, "Error: Invalid amount")
         returns(bool)
    {
           totalOrders +=1;       
           Order storage order = orders[totalOrders];
           order.orderId = totalOrders;
           order.manager = managerAddress;
           order.dueDate = dueDateTimestamp;
           order.paymentToken = _paymentToken;
           order.state = State.Pending;
           order.amount = _amount;
           order.createdAt = block.timestamp;
            
           IERC20(_paymentToken).transferFrom(_msgSender(), address(this),_amount);
 
           emit OrderCreated(totalOrders);         
           return true;  
    }   

    // distribute funds with single transaction vs allowing claims
    function claimFunds(uint256 orderId)
        public
        condition((orders[orderId].manager==_msgSender()||_msgSender()== owner()), "Error: Must be the manager or owner")   
        condition(((orders[orderId].state==State.Completed)||(orders[orderId].state==State.Pending)), "Error: Invalid current state")   
        condition((orders[orderId].dueDate <= block.timestamp), "Error: Cannot claim funds before dueDate")  
     {
        Order storage order = orders[orderId];    
        order.releasedAt = block.timestamp;
        order.state = State.Released;
      
        emit OrderCompletedAndReleased(orderId,_msgSender());

        IERC20(order.paymentToken).transfer(order.manager, order.amount);

    }
       
    
    function orderDetails(uint256 orderId)
        public view
        // condition((orders[orderId].manager==_msgSender()||_msgSender()== owner() || orders[orderId].buyer==_msgSender()), "Error: Caller not seller/buyer/owner")   
        returns (address manager, address paymentToken, State state, uint256 dueDate, uint256 amount, uint256 createdAt, uint256 releasedAt,uint256 completedAt)
      {
        Order memory order = orders[orderId];       
        return (order.manager, order.paymentToken, order.state, order.dueDate, order.amount, order.createdAt, order.releasedAt, order.completedAt);
    }
}
