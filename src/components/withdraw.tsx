import { useContext, useEffect, useMemo, useState } from 'react';

import './panes.css';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import {
  faArrowRight,
  faArrowTurnDown,
  faCheckCircle,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  fetchBalance,
  prepareSendTransaction,
  fetchFeeData,
  waitForTransaction
} from '@wagmi/core';
import { ec as EC } from 'elliptic';
import { ethers } from 'ethers';
import { parseEther } from 'viem'
import { getAddress, keccak256 } from 'ethers/lib/utils';
import { useAccount, useContractRead, useNetwork,} from 'wagmi';
import { VerxioPayABI } from '../contracts/abi.json';
import { copyTextToClipboard } from '../utils/clipboard';
import { registryAddress, explorer } from '../utils/constants';
import { AddressContext, AddressContextType } from './address';

export function Withdraw() {
  const ec = useMemo(() => {
    return new EC('secp256k1');
  }, []);

  const { spendingKey } = useContext(AddressContext) as AddressContextType;
  const [keyAddrs, setKeyAddrs] = useState<Array<string[]>>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [active, setActive] = useState<any>({});
  const [targetAddr, setTargetAddr] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isAddressValid, setIsAddressValid] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>();
  const [withdrawError, setWithdrawError] = useState<string>();
  const [txPending, setTxPending] = useState<string>('');

  const { chain } = useNetwork();
  const { isConnected, address } = useAccount();

  const registryConfig = {
    address: registryAddress[chain?.id || 100|| 10200],
    abi: VerxioPayABI,
  };
  const explorerAddress = explorer[chain?.id || 100|| 10200];

  const [keysCount, setKeysCount] = useState<number>(0);
  const [keysIndex, setKeysIndex] = useState<number>(0);

  useEffect(() => {
    setKeyAddrs([]);
    setKeysIndex(0);
  }, [spendingKey, chain]);

  const { refetch: refetchKeys } = useContractRead({
    ...registryConfig,
    functionName: 'getNextKeys',
    args: [keysIndex] as const,
    enabled: isConnected,
  });

  const { data: _keysCount, refetch: refetchKeysCount } = useContractRead({
    ...registryConfig,
    functionName: 'totalKeys',
    enabled: isConnected,
  });


  useEffect(() => {
    if (!isConnected || !!!_keysCount) return;

    setKeysCount(Number(_keysCount) || 0);
    const handler = setInterval(() => {
      refetchKeysCount().then((x) =>
        setKeysCount(Number(x.data))
      );
    }, 10000);

    return () => {
      clearInterval(handler);
    };
  }, [isConnected, chain, refetchKeysCount]);

  useEffect(() => {
    if (!keysCount || !spendingKey || !isConnected) return;

    // console.log('Effect keys, idx: ' + keysIndex);

    refetchKeys().then((x) => {
      findMatch(x.data as KeyObject[]).then(() => {
        if (keysCount > keysIndex) {
          // delay between sequential calls
          setTimeout(() => {
            setKeysIndex(Math.min(keysCount, keysIndex + 10));
          }, 750);
        }
      });
    });
  }, [keysCount, refetchKeys, isConnected, spendingKey, keysIndex]);

  useEffect(() => {
    setTargetAddr('');
    setIsSending(false);
    setIsAddressValid(true);
    setWithdrawError(undefined);
    setWithdrawSuccess(undefined);
    setTxPending('');
  }, [modalVisible]);

  useEffect(() => {
    try {
      getAddress(targetAddr);
      setIsAddressValid(true);
    } catch (e) {
      setIsAddressValid(false);
    }
  }, [targetAddr]);

  interface KeyObject {
    x: string;
    y: string;
    ss: string;
    token: string;
  }

  const findMatch = async (keys: KeyObject[]) => {
    if (!spendingKey || !isConnected) return;

    const _addrs = await Promise.all(

      keys.map(async (key) => {
      
        const {x, y, ss, token} = key;
        const _x = parseInt(x, 16);
        const _y = parseInt(y, 16);

    

        if (_x === 0 || _y === 0) return null;

        let eph;
        try {
          eph = ec.keyFromPublic(`04${x.slice(2)}${y.slice(2)}`, 'hex');
        } catch (e) {
          console.error("Error", e)
          return null;
        }

        const _ss = spendingKey.derive(eph.getPublic());


        // early check if shared secret might be the same
        if (_ss.toArray()[0] == parseInt(ss, 16)) return null;

        const hashed = ec.keyFromPrivate(keccak256(_ss.toArray()));
        // console.log(hashed)
        const pub = spendingKey
          .getPublic()
          .add(hashed.getPublic())
          .encode('array', false);

        const _addr = keccak256(pub.splice(1));
        const addr = getAddress(
          '0x' + _addr.substring(_addr.length - 40, _addr.length)
        );

        if (token === ethers.constants.AddressZero) {
          const bal = await fetchBalance({ address: `0x${addr.substring(2)}` });

          if (bal) {
            return [x, y, token, bal.formatted, addr];
          }
        } else {
          console.error("Token transfers aren't supported yet");
        }
        
        return null;
      })
    );

    const addrs = _addrs.filter((_y) => _y !== null);
    // console.log('Found new keys: ' + addrs.length + ' from ' + keys.length);
    setKeyAddrs([...keyAddrs, ...(addrs as Array<string[]>)]);

    // console.log(addrs)

  };

  const buildPrivateKey = (x: string, y: string, spendingKey: EC.KeyPair) => {
    const eph = ec.keyFromPublic(`04${x.slice(2)}${y.slice(2)}`, 'hex');

    const ss = spendingKey.derive(eph.getPublic());
    const hashed = ec.keyFromPrivate(keccak256(ss.toArray()));

    const _key = spendingKey.getPrivate().add(hashed.getPrivate());
    const key = _key.mod(ec.curve.n);

    return key;
  };

  const withdraw = async (
    x: string,
    y: string,
    // token: string,
    addr: `0x${string}`,
    target: `0x${string}`
  ) => {
    if (!spendingKey) return;
  
    setIsSending(true);
    const bal = await fetchBalance({ address: addr });
    const key = buildPrivateKey(x, y, spendingKey);
        // Prepare the transaction
      let request = await prepareSendTransaction({
        to: target,
        // value: parseEther(bal.formatted) ,
      });

    try {
      const provider = new StaticJsonRpcProvider(chain?.rpcUrls.public.http[0]);
      const signer = new ethers.Wallet(key.toArray(undefined, 32), provider);

      let gasLimit = request.gas!;
      const feeData = await fetchFeeData()
      const gasPrice = feeData.gasPrice!

      let fee = gasLimit * gasPrice;
      const originalBalance = parseEther(bal.formatted);

      // request = {
      //   ...request,
      //   // account: addr,
      //   to: target,
      //   value: originalBalance - fee,
      //   gasPrice: gasPrice,
      // };


      const sendValue =  originalBalance - fee
      const result = await signer.sendTransaction({
        to: target,
        value: sendValue,
        gasPrice: gasPrice
      });
      
      setTxPending(result.hash);
      const data = await waitForTransaction({
        hash: result.hash as `0x${string}`,
      });

      setTxPending('');
      setWithdrawSuccess(data.transactionHash);

      // exclude address from the list
      setKeyAddrs(keyAddrs.filter((p) => p[4] !== addr));
    } catch (e) {
      setWithdrawError((e as Error).message);
      setTxPending('');
    }

    setIsSending(false);
  };

  if (!isConnected) {
    return (
      <div className="lane">
        <p>
          <b
            onClick={() => {
              window.scrollTo({ top: 0 });
            }}
          >
            Connect wallet
          </b>{' '}
          to proceed.
        </p>
      </div>
    );
  } else {
    return (
      <div>
        {keyAddrs.length === 0 && !modalVisible && (
          <div className="lane" style={{ marginTop: '1rem' }}>
            <p className="message">Nothing to withdraw yet.</p>
          </div>
        )}

      {keyAddrs.length > 0 && !modalVisible && (
        <div className="lane" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
            {keyAddrs
              // .filter((item) => Number(item[3]) > 0) // Filter out items with balance <= 0
              .map((item, index) => {
                const [_x, _y, token, bal, addr] = item;
                return (
                  <div
                    key={index}
                    style={{
                      minHeight: '1.8rem',
                      margin: '0 1rem 0.75rem 0',
                    }}
                  >
                    <button
                      className="hbutton"
                      color="success"
                      onClick={(e) => {
                        e.preventDefault();
                        setActive({
                          x: _x,
                          y: _y,
                          token,
                          addr,
                          balance: Number(bal),
                        });
                        setModalVisible(true);
                      }}
                    >
                      {bal} {chain?.nativeCurrency.symbol}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

        <div className={modalVisible ? 'modal active' : 'modal'}>
          <div className="lane" style={{ marginTop: '1rem' }}>
            <div className="modal-window">
              <h2 style={{ fontWeight: 'normal', height: '44px' }}>
                Withdraw {active.balance || '0'}{' '}
                {chain?.nativeCurrency.symbol}
              </h2>

              <button
                className="hbutton hbutton-lnk"
                style={{
                  paddingLeft: 0,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setModalVisible(false);
                }}
              >
                back to list
              </button>
            </div>
          </div>
          <div className="lane" style={{ marginTop: '0.5rem' }}>
            <form
              onSubmit={() => {
                return false;
              }}
            >
              <div className="input-container">
                <input
                  type="text"
                  id="targetAddr"
                  value={targetAddr}
                  className={!isAddressValid ? 'error-input' : ''}
                  spellCheck="false"
                  autoComplete="off"
                  placeholder="0x943sI865PYt2W..."
                  disabled={isSending}
                  onChange={(e) => {
                    setIsAddressValid(true);
                    setTargetAddr(e.target.value);
                  }}
                />
                <label htmlFor="targetAddr">To address</label>
              </div>
              <div className="lane" style={{ marginTop: '0.5rem' }}>
                <button
                  className="hbutton hbutton-lnk"
                  style={{
                    fontSize: '87.5%',
                    paddingLeft: 0,
                    paddingTop: 0,
                    textTransform: 'lowercase',
                  }}
                  disabled={isSending}
                  onClick={(e) => {
                    e.preventDefault();
                    setTargetAddr(address || '');
                  }}
                >
                  use connected wallet
                </button>
              </div>
            </form>
          </div>

          {!!spendingKey && (
            <div className="lane" style={{ marginTop: '1.25rem' }}>
              <div className="header-item">
                <button
                  className="hbutton"
                  disabled={isSending || !targetAddr || !isAddressValid}
                  onClick={() =>
                    withdraw(
                      active.x,
                      active.y,
                      // active.token,
                      active.addr as `0x${string}`,
                      targetAddr as `0x${string}`
                    )
                  }
                >
                  <span>
                    <FontAwesomeIcon icon={faArrowTurnDown} flip="horizontal" />
                    &nbsp;
                    {isSending ? 'Sending...' : 'Withdraw'}
                  </span>
                </button>
                <button
                  className="hbutton hbutton-lnk"
                  onClick={() => {
                    const key = buildPrivateKey(
                      active.x,
                      active.y,
                      spendingKey
                    );
                    copyTextToClipboard(key.toString(16, 32));
                    setIsCopied(true);
                    setTimeout(() => {
                      setIsCopied(false);
                    }, 1500);
                  }}
                >
                  <span>
                    <FontAwesomeIcon icon={isCopied ? faCheckCircle : faCopy} />{' '}
                    &nbsp;
                    {isCopied ? 'Copied!' : 'Copy private key'}
                  </span>
                </button>
              </div>
            </div>
          )}
          {(!!withdrawError || !!withdrawSuccess || !!txPending) && (
            <div className="lane">
              {txPending !== '' && (
                <p className="message">
                  <span>Transaction pending. </span>
                  <a
                    href={`https://${explorerAddress}/tx/${txPending}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-text"
                  >
                    View on {chain?.name.split(' ')[0]} Explorer{' '}
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      transform={{ rotate: -45 }}
                    />
                  </a>
                </p>
              )}
              {!!withdrawError && (
                <p className="message error">Error: {withdrawError}</p>
              )}
              {!!withdrawSuccess && (
                <p className="message">
                  <strong>Transaction sent! </strong>
                  <a
                    href={`https://${explorerAddress}/tx/${withdrawSuccess}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-text"
                  >
                    View on {chain?.name.split(' ')[0]} Explorer{' '}
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      transform={{ rotate: -45 }}
                    />
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lane">
          <p className="discreet">
            Keys checked: {keysIndex} / {keysCount}
          </p>
        </div>
      </div>
    );
  }
}
