import React, { Component } from 'react';
import Web3 from 'web3';
//import '../App.css';
import Img from '../abis/Image.json';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 3000, protocol: 'https' }) 

class Main extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. Please Connect to MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load accounts from ganache
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Img.networks[networkId]
    if(networkData) {
      const contract = web3.eth.Contract(Img.abi, networkData.address)
      this.setState({ contract })
      const ImgHash = await contract.methods.get().call()
      this.setState({ ImgHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      ImgHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  ImageChange = (event) => {
    event.preventDefault();
    console.log("Uploading file to ipfs");
    ipfs.add(this.state.buffer, (error, res) => {
      console.log('Ipfs result', res);
      if(error) {
        console.error(error)
        return
      }
       this.state.contract.methods.set(res[0].hash).send({ from: this.state.account })
       .then((r) => {
         return this.setState({ ImgHash: res[0].hash })
       })
    })
  }

  render() {
    return (
      <>
      <img src={`https://ipfs.infura.io/ipfs/${this.state.ImgHash}`} />
      <form onSubmit={this.ImageChange} >
          <input type='file' onChange={this.captureFile}/>
          <input type='submit'/>
      </form>
      </>
    );
  }
}

export default Main;