// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Image {
    string imageHash;    

    function setImage(string memory _imageHash) public {
        imageHash = _imageHash;
    }
    
    function getImage() public view returns(string memory){
        return imageHash;
    }
}