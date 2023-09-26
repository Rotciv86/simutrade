import axios from "axios";
import * as cheerio from 'cheerio';

const scrapeData = () => {
    return new Promise((resolve, reject) => {
      axios.get("https://bitinfocharts.com/top-100-richest-bitcoin-addresses.html")
        .then((response) => {
          const html = response.data;
          const $ = cheerio.load(html);
  
          const desiredNode = $("table.table-condensed tbody tr:nth-child(10) td:nth-child(4)");
          // Verificar si se encontró el nodo deseado y obtener los valores
          if (desiredNode.length > 0) {
            const dataBtc = desiredNode.attr('data-val');
  
            axios.get("https://www.bitcoin.de/de/btceur/market")
              .then((response) => {
                const html = response.data;
                const $ = cheerio.load(html);
  
                let desiredNodeBuy = $("span#rate_buy");
  
                // Verificar si se encontró el nodo deseado y obtener los valores
                if (desiredNodeBuy.length > 0) {
                  const buyPriceBtc = (+desiredNodeBuy.attr('data-rate').replace(",", ""));
  
                  let desiredNodeSell = $("span#rate_sell");
  
                  // Verificar si se encontró el nodo deseado y obtener los valores
                  if (desiredNodeSell.length > 0) {
                    const sellPriceBtc = (+desiredNodeSell.attr('data-rate').replace(",", ""));
                    const result = [dataBtc, buyPriceBtc, sellPriceBtc];
                    resolve(result);
                  } else if (desiredNodeSell.length === 0) {
                    desiredNodeSell = $("span#current_price_sell");
                    const sellPriceBtc = +desiredNodeSell.attr('data-exchange-rate').replace(/[^0-9.,]/g, "").replace(",", ".");
                    const result = [dataBtc, buyPriceBtc, sellPriceBtc];
                    resolve(result);
                  } else {
                    reject("Nodo de venta no encontrado");
                  }
                } else if (desiredNodeBuy.length === 0) {
                  desiredNodeBuy = $("span#current_price_buy");
                  const buyPriceBtc = +desiredNodeBuy.attr('data-exchange-rate').replace(/[^0-9.,]/g, "").replace(",", ".");
  
                  let desiredNodeSell = $("span#rate_sell");
  
                  // Verificar si se encontró el nodo deseado y obtener los valores
                  if (desiredNodeSell.length > 0) {
                    const sellPriceBtc = (+desiredNodeSell.attr('data-rate').replace(",", ""));
                    const result = [dataBtc, buyPriceBtc, sellPriceBtc];
                    resolve(result);
                  } else if (desiredNodeSell.length === 0) {
                    desiredNodeSell = $("span#current_price_sell");
                    const sellPriceBtc = +desiredNodeSell.attr('data-exchange-rate').replace(/[^0-9.,]/g, "").replace(",", ".");
                    const result = [dataBtc, buyPriceBtc, sellPriceBtc];
                    resolve(result);
                  } else {
                    reject("Nodo de venta no encontrado");
                  }
                } else {
                  reject("Nodo de compra no encontrado");
                }
              })
              .catch((error) => {
                reject(error);
              });

              axios.get("https://app.uniswap.org/#/swap")
                .then((response) => {
                  const html = response.data;
                  const $ = cheerio.load(html);
  
                let desiredNodeBuy = $("input#swap-currency-output");

                const buyPriceEth = +desiredNodeBuy.attr('value');
                console.log(buyPriceEth);
                })
                .catch((error) => {
                  reject(error);
                });
          } else {
            reject("Nodo no encontrado");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  
  export default scrapeData;
  