import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import Box from 'grommet/components/Box'
import Heading from 'grommet/components/Heading'
import Layer from 'grommet/components/Layer'
import Image from 'grommet/components/Image'
import TextInput from 'grommet/components/TextInput'
import Spinning from 'grommet/components/icons/Spinning'

import appConfig from './appConfig'

export default class JenioInitModal extends Component {
    constructor() {
        super()

        this.state = {
            token: null,
            barcode: '',
            submitting: false
        }

        this._handleKeyPress = this._handleKeyPress.bind(this)
    }

    componentDidMount() {
        this.setState({
            token: (Math.floor(Math.random() * 900000) + 100000).toString()
        })
    }

    render() {
        const { token, submitting, barcode } = this.state

        return (
            <Layer onClose={() => {
                this.props.toggleJenioInitModal()
                this.props.toggleJenioSuccessModal()
            }}>
                <Box
                    align='center'
                    pad='small'>
                    <Image
                        size='small'
                        src='public/img/jenio.png' />
                    <Box
                        align='center'
                        pad='small'>
                        <Heading
                            tag='h4'
                            align='center'
                            strong
                            margin='none'>
                            Your transaction code is <i>{token}</i>
                        </Heading>
                        <Box pad={{ vertical: 'small', horizontal: 'none' }}>
                            <Heading
                                tag='h4'
                                align='center'
                                strong
                                margin='none'>
                                Pass this code to your customer and scan the barcode generated by your customer's JENIO app.
                            </Heading>
                        </Box>
                        {
                            submitting ? 
                                <Spinning size='medium' /> : 
                                <Box pad={{ vertical: 'small', horizontal: 'none' }}>
                                    <input
                                        ref='tokenField'
                                        type='text'
                                        value={barcode}
                                        onChange={(e) => this.setState({ barcode: e.target.value })}
                                        onKeyPress={this._handleKeyPress} />
                                </Box>                                        
                        }
                    </Box>
                    <Box
                        align='center'
                        pad='medium'>
                        <Heading
                            tag='h5'
                            align='center'
                            margin='none'>
                            © TEAM JENIO 2017
                        </Heading>
                    </Box>
                </Box>
            </Layer>
        )
    }

    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.setState({ submitting: true })                            
            
            const { baseApiUrl, merchantId } = appConfig
            const transactionData = e.target.value.split(',');
            const buyerId = transactionData[0];
            const signed_token = transactionData[1];
            const token = this.state.token;

            if (!buyerId || !signed_token) {
                alert('invalid input format')
                this.props.toggleJenioInitModal()
                this.props.toggleJenioFailedModal()
            } else {
                axios.post(`${baseApiUrl}/transfer`, {
                    sender: buyerId,
                    receiver: merchantId,
                    amount: '121'
                })
                .then(res => {
                    this.setState({ barcode: '', submitting: false })          
                    this.props.toggleJenioInitModal()
                    if (res.data.result) {
                        const { balance_before, balance_after} = res.data.result
                        this.props.setBalance(balance_before, balance_after)
                        this.props.toggleJenioSuccessModal()
                    } else {
                        this.props.toggleJenioFailedModal()
                    }
                })
            }
        }
    }
}