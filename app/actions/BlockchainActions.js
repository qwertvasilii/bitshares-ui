import alt from "alt-instance";
import {Apis} from "neuronjs-ws";

let latestBlocks = {};

class BlockchainActions {

    getLatest(height, maxBlock) {
        // let start = new Date();
        return (dispatch) => {
            if (!latestBlocks[height] && maxBlock) {
                latestBlocks[height] = true;
                Apis.instance().db_api().exec("get_block", [
                    height
                ])
                .then((result) => {
                    if (!result) {
                        return;
                    }
                    result.id = height; // The returned object for some reason does not include the block height..
                    // console.log("time to fetch block #" + height,":", new Date() - start, "ms");
                    console.log(result);
                    result.transactions_count = result.transactions.length;

                    dispatch({block: result, maxBlock: maxBlock});

                }).catch((error) => {
                    console.log("Error in BlockchainActions.getLatest: ", error);
                });
            }
        };
    }

    getBlock(height) {
        return (dispatch) => {
            Apis.instance().db_api().exec("get_block", [
                height
            ])
            .then((result) => {
                if (!result) {
                    return false;
                }
                result.id = height; // The returned object for some reason does not include the block height..
                result.transactions_count = result.transactions.length;
                console.log("Got block");
                dispatch(result);
            }).catch((error) => {
                console.log("Error in BlockchainActions.getBlock: ", error);
            });
        };
    }

    getBlockHeader(height) {
        return (dispatch) => {
            Apis.instance().db_api().exec("get_block_header", [
                height
            ])
            .then((header) => {
                if (!header) {
                    return false;
                }             
                header.id = height; // The returned object for some reason does not include the block height..
                //console.log("Got header", header);   
                Apis.instance().db_api().exec("get_transaction_count", [
                    height
                ])
                .then((tr_count) => {
                    Apis.instance().db_api().exec("get_transaction_batch", [
                        height, 0, 100
                    ])
                    .then((transactions) => {
                        //console.log("Tr count is ", result);
                        header.transactions = transactions;
                        header.transactions_count = tr_count;
                        header.witness_signature = "";
                        console.log("Got block header", header);
                        dispatch(header);
                    });
                });
            })
            .catch((error) => {
                console.log("Error in BlockchainActions.getBlockHeader: ", error);
            });
        };
    }

    getTransactionBatch(height, start, end) {
        return (dispatch) => {
            Apis.instance().db_api().exec("get_transaction_batch", [
                height, start, end
            ])
            .then((result) => {
                if (!result) {
                    return false;
                }
                result.id = height; // The returned object for some reason does not include the block height..
                console.log("Got transaction batch");
                dispatch(result);
            }).catch((error) => {
                console.log("Error in BlockchainActions.getTransactionBatch: ", error);
            });
        };
    }

    getTransactionCount(height) {
        return (dispatch) => {
            Apis.instance().db_api().exec("get_transaction_count", [
                height, start, end
            ])
            .then((result) => {
                if (!result) {
                    return false;
                }
                result.id = height; // The returned object for some reason does not include the block height..
                console.log("Got transaction count");
                dispatch(result);
            }).catch((error) => {
                console.log("Error in BlockchainActions.getTransactionCount: ", error);
            });
        }; 
    }

    updateRpcConnectionStatus(status) {
        return status;
    }
}

const BlockchainActionsInstance = alt.createActions(BlockchainActions);
Apis.setRpcConnectionStatusCallback(BlockchainActionsInstance.updateRpcConnectionStatus);

export default BlockchainActionsInstance;
