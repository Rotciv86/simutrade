// updateSheet2.js
import { google } from "googleapis";
import scrapeData from "../scrapeData/scrapeData.js"

async function fourHourWhalesDifference() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = "1r-jUnxB0CD_PRuuA_KP1Y5l8ibap6vckTmbtgN522m8"; // Reemplaza con el ID de tu hoja de cálculo
    const googleSheets = google.sheets({ version: "v4", auth: client });

    // Obtén los valores de la Hoja 2 (asume que ya está configurada)
    const range = "Hoja 4!A:E"; // Reemplaza con el rango adecuado
    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values || [];
    const lastRow = values[values.length - 1]; // Última fila de datos
    console.log(lastRow)

    const scrapedData = await scrapeData();
    const [dataBtc, buyPriceBtc, sellPriceBtc] = scrapedData;

    const numericDataBtc = parseFloat(dataBtc);

    // Obtén el último valor de dataBtc registrado en la Hoja 2 (asume que está en la columna B)
    const lastDataBtc = parseFloat(lastRow[1]);
    console.log(lastDataBtc)
    console.log(lastDataBtc - numericDataBtc)
    // Compara el valor actual de dataBtc con el valor en la última fila
    const threshold = 13; // Define un umbral pequeño para considerar la diferencia


        let difference = numericDataBtc - lastDataBtc;

        console.log(difference)

        const dateOptions = { timeZone: 'Europe/Madrid' };
        const formattedDate = new Date().toLocaleString('es-ES', dateOptions);

      // Si la variación es mayor o igual a 1.0 (ajusta según tus necesidades)
      const updatedRow = [formattedDate, numericDataBtc, difference, buyPriceBtc, sellPriceBtc];

      // Agrega la nueva fila a la Hoja 2
      const resource = {
        values: [updatedRow],
      };

      await googleSheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource,
      });

      console.log("Nueva fila agregada a la Hoja 4.");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

export default fourHourWhalesDifference;
