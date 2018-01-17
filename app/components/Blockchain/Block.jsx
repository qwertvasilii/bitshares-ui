import React from "react";
import {PropTypes} from "react";
import {FormattedDate} from "react-intl";
import Immutable from "immutable";
import BlockchainActions from "actions/BlockchainActions";
import Transaction from "./Transaction";
import Translate from "react-translate-component";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import LinkToWitnessById from "../Utility/LinkToWitnessById";

class TransactionList extends React.Component {

    shouldComponentUpdate(nextProps) {
        return (
                nextProps.block.id !== this.props.block.id
            );
    }

    /*componentWillReceiveProps(np) {        
        if (np.height !== this.props.height) {
            console.log("_getBlockHeader call");
            this._getBlockHeader(np.height);
            //this._getBlock(np.height);
        }
        console.log("componentWillReceiveProps call");
        this._getTransactionBatch(np.height, 0);
    }*/

    _getTransactionBatch(block_num, start) {
        height = parseInt(start, 10);
        BlockchainActions.getTransactionBatch(block_num, start, start+100);
    }

    render() {
        console.log("Begin block render");
        let {block} = this.props;
        //let {transactions_store} = _getTransactionBatch(this.props.height, 0); //this.props;
        let transactions = null;
        transactions = [];

        if (block.transactions.length > 0) {
            transactions = [];
     
            block.transactions.splice(0,100).forEach((trx, index) => {
                transactions.push(
                    <Transaction
                        key={index}
                        trx={trx}
                        index={index}
                    />);
            });
        }

        return (
                <div>
                    {transactions}
                </div>
            );
    }
}


class Block extends React.Component {
    static propTypes = {
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
        blocks: PropTypes.object.isRequired,
        block_headers: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired
    }

    static defaultProps = {
        dynGlobalObject: "2.1.0",
        blocks: {},
        block_headers: {},
        height: 1
    };

    constructor(props) {
        super(props);

        this.state = {
            showInput: false
        };
    }

    componentDidMount() {
        //this._getBlock(this.props.height);
        this._getBlockHeader(this.props.height);
    }

    componentWillReceiveProps(np) {        
        if (np.height !== this.props.height) {
            console.log("_getBlockHeader call");
            this._getBlockHeader(np.height);
            //this._getTransactionBatch(np.height, 0);
            //this._getBlock(np.height);
        }
    }

    shouldComponentUpdate(np, ns) {
        return (
            //!Immutable.is(np.blocks, this.props.blocks) ||
            np.height !== this.props.height ||
            np.dynGlobalObject !== this.props.dynGlobalObject ||
            ns.showInput !== this.state.showInput ||
            !Immutable.is(np.block_headers, this.props.block_headers)
        );
    }

    _getBlock(height) {
        if (height) {
            height = parseInt(height, 10);
            if (!this.props.blocks.get(height)) {
                BlockchainActions.getBlock(height);
            }
        }
    }

    _getBlockHeader(height) {
        if (height) {
            height = parseInt(height, 10);
            if (!this.props.blocks.get(height)) {
                BlockchainActions.getBlockHeader(height);
                //console.log(this.props);
            }
        }
    }

    _getTransactionBatch(block_num, start) {
        if (block_num && start) {
            block_num = parseInt(block_num, 10);
            start = parseInt(start, 10);
            BlockchainActions.getTransactionBatch(block_num, start, start+100);
        }
    }

    _getTransactionCount(height) {
        if (height) {
            height = parseInt(height, 10);
            if (!this.props.block_headers.get(height)) {
                BlockchainActions.getTransactionCount(height);
            }
        }
    }

    _nextBlock() {
        let height = this.props.params.height;
        let nextBlock = Math.min(this.props.dynGlobalObject.get("head_block_number"), parseInt(height, 10) + 1);
        this.props.router.push(`/block/${nextBlock}`);
    }

    _previousBlock() {
        let height = this.props.params.height;
        let previousBlock = Math.max(1, parseInt(height, 10) - 1);
        this.props.router.push(`/block/${previousBlock}`);
    }

    toggleInput(e) {
        e.preventDefault();
        this.setState({showInput: true});
    }

    _onKeyDown(e) {
        if (e && e.keyCode === 13) {
            this.props.router.push(`/block/${e.target.value}`);
            this.setState({showInput: false});
        }
    }

    _onSubmit() {
        const value = this.refs.blockInput.value;
        if (value) {
            this._onKeyDown({keyCode: 13, target: {value}});
        }
    }

    render() {
        const { showInput } = this.state;
        let {blocks} = this.props;
        let {block_headers} = this.props;
        let height = parseInt(this.props.height, 10);
               
        let block = block_headers.get(height);
        if (!block)
            block = blocks.get(height);
        //console.log("B header ", block);

        let blockHeight = showInput ?
            <span className="inline-label">
                <input ref="blockInput" type="number" onKeyDown={this._onKeyDown.bind(this)}/>
                <button onClick={this._onSubmit.bind(this)} className="button"><Translate content="explorer.block.go_to" /></button>
            </span> :
            <span>
                <Translate style={{textTransform: "uppercase"}} component="span" content="explorer.block.title" />
                <a onClick={this.toggleInput.bind(this)}>
                    &nbsp;#{height}
                </a>
            </span>;

        return (
            <div className="grid-block page-layout">
                <div className="grid-block main-content">
                <div className="grid-content">
                        <div className="grid-content no-overflow medium-offset-2 medium-8 large-offset-3 large-6 small-12">
                        <h4 className="text-center">

                            {blockHeight}
                        </h4>
                        <ul>
                           <li><Translate component="span" content="explorer.block.date" />:  {block ? <FormattedDate
                                value={block.timestamp}
                                format="full"
                                /> : null}
                            </li>
                            <li><Translate component="span" content="explorer.block.witness" />:  {block ? <LinkToWitnessById witness={block.witness} /> : null}</li>
                            <li><Translate component="span" content="explorer.block.previous" />: {block ? block.previous : null}</li>
                            <li><Translate component="span" content="explorer.block.transactions" />: {block ? block.transactions_count : null}</li>
                        </ul>
                        <div className="clearfix" style={{marginBottom: "1rem"}}>
                            <div className="button float-left outline" onClick={this._previousBlock.bind(this)}>&#8592;</div>
                            <div className="button float-right outline" onClick={this._nextBlock.bind(this)}>&#8594;</div>
                        </div>
                        {block ? <TransactionList
                            block={block}
                        /> : null}
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default BindToChainState(Block, {keep_updating: true});
