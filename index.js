import express from "express";
import { google } from "googleapis";
import scrapeData from "./scrapeData/scrapeData.js";
import axios from "axios";
import whalesDifferences from "./whalesDifference/whalesDifferences.js";
import oneHourWhalesDifference from "./whalesDifference/oneHourWhalesDifference.js";
import fourHourWhalesDifference from "./whalesDifference/fourHourWhalesDifference.js";
import dailyWhalesDifference from "./whalesDifference/dailyWhalesDifference.js";

const app = express();
let googleSheets; // Variable global para acceder a la instancia de Google Sheets API

app.get("/", async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = "1r-jUnxB0CD_PRuuA_KP1Y5l8ibap6vckTmbtgN522m8";

    // Instance of Google Sheets API
    googleSheets = google.sheets({ version: "v4", auth: client });

    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
      spreadsheetId,
    });

    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Hoja 1!A:A",
    });

    const rows = getRows.data.values || []; // Obtener los valores de las filas

    // Call scrapeData initially
    const scrapedData = await scrapeData();
    const [dataBtc, buyPriceBtc, sellPriceBtc] = scrapedData;
    const updatedRows = [...rows, [getCurrentDateTime(), dataBtc, buyPriceBtc, sellPriceBtc]]; // Agregar los datos raspados a las filas existentes

    // Update spreadsheet
    const resource = {
      values: updatedRows,
    };

    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Hoja 1!A:B",
      valueInputOption: "USER_ENTERED",
      resource,
    });

    res.send(updatedRows);

    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.listen(1337, () => {
  console.log("Running on 1337");
let initialBtcAmount = 0.1; // Cantidad inicial en BTC
let totalEur = 0; // Total de euros
let firstAction = true; // Variable para controlar la primera acción
let previousDataBtc = 0; // Valor previo de dataBtc
let lastAction = "";
let lastBuyedPrice = 0;
let lastSelledPrice = 0;
  // Call scrapeData every 5 minutes
  setInterval(async () => {
    try {
      
        const auth = new google.auth.GoogleAuth({
          keyFile: "credentials.json",
          scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        // Create client instance for auth
        const client = await auth.getClient();

        // Instance of Google Sheets API
        const spreadsheetId = "1r-jUnxB0CD_PRuuA_KP1Y5l8ibap6vckTmbtgN522m8"; // Reemplaza con el ID de tu hoja de cálculo
        const googleSheets = google.sheets({ version: "v4", auth: client });
      

      //         // Obtener el valor de la última casilla de la columna B (BTC)
      // const getLastBtcValue = await googleSheets.spreadsheets.values.get({
      //   spreadsheetId,
      //   range: "Hoja 1!B:B", // Rango de la columna B
      //   valueRenderOption: "FORMULA", // Obtener el valor calculado en lugar de la fórmula
      //   dateTimeRenderOption: "FORMATTED_STRING", // Obtener fechas y horas en formato legible
      // });
  
      // const btcValues = getLastBtcValue.data.values || [];
      // const lastBtcValue = btcValues[btcValues.length - 1][0]; // El último valor en la columna B
  
      // // Asignar el último valor de BTC como initialBtcAmount
      //   initialBtcAmount = parseFloat(lastBtcValue);

      const range = "Hoja 1!A:E"; // Reemplaza con el rango adecuado
      const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
  
      const values = response.data.values || [];
      const lastRow = values[values.length - 1]; // Última fila de datos
      console.log(lastRow)

        console.log(initialBtcAmount);


      const scrapedData = await scrapeData();
      const [dataBtc, buyPriceBtc, sellPriceBtc] = scrapedData;

      const numericDataBtc = parseFloat(dataBtc);

      const formattedDataBtc = numericDataBtc.toFixed(7); // Ajustar la cantidad de decimales// Ajustar la cantidad de decimales
      const formattedBuyPriceBtc = buyPriceBtc.toFixed(2); // Ajustar la cantidad de decimales
      const formattedSellPriceBtc = sellPriceBtc.toFixed(2); // Ajustar la cantidad de decimales

      const dateOptions = { timeZone: 'Europe/Madrid' };
      const formattedDate = new Date().toLocaleString('es-ES', dateOptions);
      // Calcular la diferencia con respecto al valor anterior

      const previousDataBtc = parseFloat(lastRow[4]);
      

      let difference;

      if (firstAction) {

        difference = 0;

      } else {

        difference = dataBtc - previousDataBtc

      }


  
      // Definir umbrales para compra y venta
      const buyThreshold = 5000;
      const sellThreshold = -5000;
  
      // Determinar la acción en función de las diferencias
      let action = "";
      let updatedBtcAmount = initialBtcAmount;
      let updatedEurTotal = totalEur;


      if (Math.abs(difference) >= buyThreshold) {
        
          action = "compra"; // Define la acción como compra si difference es positivo
      }else if (Math.abs(difference) <= sellThreshold){
          action = "venta"; // Define la acción como venta si difference es negativo
        
      }

      if (firstAction) {
        // La primera acción debe ser una venta
        const updatedRow = [
          formattedDate,
          updatedBtcAmount,
          updatedEurTotal,
          action,
          numericDataBtc, // Usar los valores formateados
          formattedBuyPriceBtc,
          formattedSellPriceBtc,
        ];
    
        // Agregar la fila a la hoja de cálculo
        const resource = {
          values: [updatedRow],
        };
    
        await googleSheets.spreadsheets.values.append({
          spreadsheetId: "1r-jUnxB0CD_PRuuA_KP1Y5l8ibap6vckTmbtgN522m8",
          range: "Hoja 1!A:G",
          valueInputOption: "USER_ENTERED",
          resource,
        });

        firstAction = false; // Desactivar la bandera después de la primera acción

      } else if (lastAction === "venta" && difference > buyThreshold && buyPriceBtc * 1.03 < lastSelledPrice) {
        action = "compra";
        console.log("Debugging compra:");
        console.log("Total EUR:", totalEur);
        console.log("Buy Price BTC:", buyPriceBtc);
        console.log("Updated BTC Amount:", updatedBtcAmount);
         // Después de una venta, la siguiente acción debe ser compra
      } else if (lastAction === "compra" && difference < sellThreshold && sellPriceBtc > lastBuyedPrice * 1.03) {
        action = "venta"; // Después de una compra, la siguiente acción debe ser venta
        console.log("Debugging venta:");
        console.log("Total EUR:", totalEur);
        console.log("Sell Price BTC:", sellPriceBtc);
        console.log("Updated BTC Amount:", updatedBtcAmount);
      } 
  
// Realizar la acción y actualizar valores si corresponde
if (action === "compra") {
  console.log('\x1b[32m compra \x1b[0m');
  const additionalBtcAmount = totalEur / buyPriceBtc;
  updatedBtcAmount += additionalBtcAmount;
  const costEur = buyPriceBtc * updatedBtcAmount;
  lastBuyedPrice = buyPriceBtc;
  console.log("Total EUR antes de la compra:", totalEur);
  console.log("Costo de la compra en EUR:", costEur);
  if (totalEur >= costEur) {
    console.log("BTC adquirido en la compra:", additionalBtcAmount);
    updatedEurTotal -= costEur;
    console.log("Total EUR después de la compra:", updatedEurTotal);
    console.log("BTC después de la compra:", updatedBtcAmount);
    lastAction = action;
  } else {
    console.log("No se pudo comprar debido a fondos insuficientes");
  }
}
 else if (action === "venta") {
        console.log('\x1b[31m venta \x1b[0m');
        const btcToSell = updatedBtcAmount; // Guardar el valor actual de BTC
        updatedBtcAmount = 0; // Establecer el valor de BTC a 0
        const earningsEur = sellPriceBtc * btcToSell; // Calcular las ganancias en euros
        updatedEurTotal += earningsEur; // Añadir las ganancias a updatedEurTotal
        lastAction = action;
        lastSelledPrice = sellPriceBtc;
      }
      
  
      if(action === "compra" || action === "venta"){

  
      // Construir la fila actualizada con la acción y las cantidades
      const updatedRow = [
        formattedDate,
        updatedBtcAmount,
        updatedEurTotal,
        action,
        numericDataBtc, // Usar los valores formateados
        formattedBuyPriceBtc,
        formattedSellPriceBtc,
      ];
  
      // Agregar la fila a la hoja de cálculo
      const resource = {
        values: [updatedRow],
      };
  
      await googleSheets.spreadsheets.values.append({
        spreadsheetId: "1r-jUnxB0CD_PRuuA_KP1Y5l8ibap6vckTmbtgN522m8",
        range: "Hoja 1!A:G",
        valueInputOption: "USER_ENTERED",
        resource,
      });
    
  
      console.log("\x1b[34m Spreadsheet updated \x1b[0m");
      console.log("lastAction:", lastAction);
      console.log("difference:", difference);
      console.log("dataBtc:", dataBtc);
      console.log("buyPriceBtc:", buyPriceBtc);
      console.log("updatedBtcAmount:", updatedBtcAmount);
      console.log("totalEur:", totalEur);

    } else {
      console.log("\x1b[34m No action taken \x1b[0m");
      console.log("difference:", difference);
      console.log("dataBtc:", dataBtc);
      console.log("buyPriceBtc:", buyPriceBtc);
      console.log("updatedBtcAmount:", updatedBtcAmount);
      console.log("totalEur:", totalEur);
      // console.log(getCurrentDateTime());
    }

    // Actualizar los valores y la última acción
    initialBtcAmount = updatedBtcAmount;
    totalEur = updatedEurTotal;
    previousDataBtc = dataBtc;
    // lastAction = action;

    console.log("lastAction:", lastAction);


    } catch (error) {
      console.error("Error:", error);
    }
  }, 60000);
 }); // 5 minutos (300,000 milisegundos)





// Ruta de ping
app.get('/ping', (req, res) => {
  res.status(200).send('Ping OK');
});

const pingInterval = 5 * 60 * 1000; // Intervalo de ping en milisegundos (5 minutos)

// Realizar un ping interno cada cierto intervalo
setInterval(async () => {
  try {
    // Realiza una solicitud de ping interno a tu propia aplicación
    const response = await axios.get('https://simutrade-4kpr.onrender.com/ping'); // Ajusta la URL según tu configuración
    if (response.status === 200 && response.data === 'Ping OK') {
      console.log('Ping interno exitoso. La aplicación está activa.');
    } else {
      console.error('Error en el ping interno. La aplicación puede estar inactiva.');
      // Toma medidas para reiniciar la aplicación o notificar si algo sale mal
    }
  } catch (error) {
    console.error('Error en el ping interno:', error.message);
    // Maneja cualquier error que pueda ocurrir durante el ping
  }
}, pingInterval);

// Tu código de servidor principal aquí...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`La aplicación está escuchando en el puerto ${PORT}`);
});

const fourHourInMiliSeconds = 4 * 60 * 60 * 1000;
const dayInMiliSeconds = 24 * 60 * 60 * 1000;


setInterval(whalesDifferences, 60000);
setInterval(oneHourWhalesDifference, 3600000);
setInterval(fourHourWhalesDifference, fourHourInMiliSeconds);
setInterval(dailyWhalesDifference, dayInMiliSeconds);



// async function updateSheetPeriodically() {
//   while (true) {
//     // Lógica para actualizar la hoja de cálculo aquí
//     await whalesDifferences(); // Supongo que esta función realiza la actualización

//     // Espera 12 horas (en milisegundos)
//     const intervalInMilliseconds = 6 * 60 * 60 * 1000;
//     await new Promise(resolve => setTimeout(resolve, intervalInMilliseconds));
//   }
// }

// // Inicia la actualización periódica
// updateSheetPeriodically();

