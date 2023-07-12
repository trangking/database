const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const { number } = require("prop-types");
const app = express();
app.use(express.json());

app.use(cors());
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "testdatabase",
});
app.get("/", (req, res) => {
  res.json("open API");
});

app.get("/typecar", (req, res) => {
  const sql =
    "SELECT CAR_TYPE_CODE,CAR_TYPE_NAME FROM car_show3 GROUP BY CAR_TYPE_NAME";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

const SelectAllElements = (params) => {
  const sql = `SELECT CAR_TYPE_CODE,CAR_TYPE_NAME,BN_CODE,BN_NAME FROM car_show3 WHERE CAR_TYPE_CODE='${params}' GROUP BY CAR_TYPE_NAME,BN_NAME `;
  return new Promise((resolve, reject) => {
    db.query(sql, (error, elements) => {
      if (error) {
        return reject(error);
      }
      return resolve(elements);
    });
  });
};
const SelectAllElements2 = async (params, brand) => {
  const sql = `SELECT MD_NAME FROM car_show3 WHERE CAR_TYPE_CODE=${params} AND BN_CODE='${brand}' GROUP BY MD_NAME `;
  return new Promise((resolve, reject) => {
    db.query(sql, (error, elements) => {
      if (error) {
        return reject(error);
      }
      return resolve(elements);
    });
  });
};
const SelectAllElements3 = async (params) => {
  const sql = `SELECT CAR_YEAR FROM car_show3 WHERE CAR_TYPE_CODE=${params} GROUP BY CAR_YEAR `;
  return new Promise((resolve, reject) => {
    db.query(sql, (error, elements) => {
      if (error) {
        return reject(error);
      }
      return resolve(elements);
    });
  });
};

app.get("/brand", async (req, res) => {
  const params = req.query.CAR_TYPE_CODE;
  const brand = req.query.BN_CODE;
  // const caryear = req.query.CAR_YEAR;
  // const MDDT_CODE = req.query.MDDT_CODE;

  try {
    const resultElements = await SelectAllElements(params);
    const resultElements2 = await SelectAllElements2(params, brand);
    const resultElements3 = await SelectAllElements3(params);
    // const resultElements4 = await SelectAllElements4(MDDT_CODE, caryear);

    res.send({
      resultElements,
      resultElements2,
      resultElements3,
      // resultElements4,
    }); // send a json response
  } catch (e) {
    console.log(e); // console log the error so we can see it in the console
    res.sendStatus(500);
  }
});

app.get("/year", async (req, res) => {
  const params = req.query.MD_NAME;
  const sql = `SELECT CAR_YEAR FROM car_show3 WHERE MD_NAME='${params}' GROUP BY CAR_YEAR`;
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

app.get("/Model_detail", async (req, res) => {
  const params = req.query.MD_NAME;
  const caryear = req.query.CAR_YEAR;
  const sql = `SELECT MDDT_CODE, MDDT_NAME FROM car_show3 WHERE MD_NAME='${params}' AND CAR_YEAR=${caryear} GROUP BY MDDT_NAME`;
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

app.get("/price", async (req, res) => {
  const params = req.query.MDDT_CODE;
  const caryears = req.query.CAR_YEAR;
  const sql = `SELECT PRICE,PERS_LEASING  FROM car_show3 WHERE MDDT_CODE='${params}' AND CAR_YEAR=${caryears} GROUP BY PRICE`;
  db.query(sql, async (error, elements) => {
    if (error) {
      return error;
    }
    const result = await Promise.all(elements);
    console.log("ราคากลาง" + result[0].PRICE);

    console.log("เปอร์เซ็นยอดที่จัดได้" + result[0].PERS_LEASING);
    console.log(
      "แสดงยอดจัดได้ : " + calTotal(result[0].PRICE, result[0].PERS_LEASING)
    );

    const Total = calTotal(result[0].PRICE, result[0].PERS_LEASING);
    console.log(Total);
    const arrTotal = {
      PRICE: result[0].PRICE,
      PERS_LEASING: result[0].PERS_LEASING,
      total: Total,
    };

    return res.send({ arrTotal });
  });
});

app.get("/persleasing", async (req, res) => {
  const params = req.query.MDDT_CODE;
  const caryear = req.query.CAR_YEAR;
  const sql = `SELECT PRICE ,PERS_LEASING FROM car_show3 WHERE MDDT_CODE='${params}' AND CAR_YEAR=${caryear} `;

  db.query(sql, async (error, elements) => {
    if (error) {
      return error;
    }
    const result = await Promise.all(elements);
    console.log("ราคากลาง" + result[0].PRICE);

    console.log("เปอร์เซ็นยอดที่จัดได้" + result[0].PERS_LEASING);
    console.log(
      "แสดงยอดจัดได้ : " + calTotal(result[0].PRICE, result[0].PERS_LEASING)
    );

    const Total = calTotal(result[0].PRICE, result[0].PERS_LEASING);
    console.log(Total);
    const arrTotal = { total: Total };

    return res.json(arrTotal);
  });
});

app.post("/principalAmount", async (req, res) => {
  const data = req.body;
  console.log(data)
  const Total = calculateinterestrate(
    parseFloat(data.principalAmount),
    parseFloat(data.interestrate),
    parseFloat(data.installmentPayment)
    
  );
  try {
    console.log(Total);
    data.total = Total;
    console.log(Total);
    // console.log(typeof {data});
    // const values = Object.values(data);
    // console.log(values);
    // for (let i = 0 ; i < data.length)
    return res.json([data]);
  } catch (error) {
    res.status(500);
  }
});

app.listen(3001, () => {
  console.log("start serve in port 3001");
});

const calTotal = (price, pers) => {
  const priceArr = price.split(",");
  const persArr = pers.split(",");
  const totalPrice = priceArr.reduce((acc, curr) => acc + curr, "");
  const totalPers = persArr.reduce((acc, curr) => acc + curr, "");
  return (parseFloat(totalPrice) * parseFloat(totalPers)) / 100;
};
const listinstallmentPayment = [
  {
    installmentPayment: 12,
    interestrate: [20],
  },
  {
    installmentPayment: 18,
    interestrate: [20],
  },
  {
    installmentPayment: 24,
    interestrate: [20, 21.75],
  },
  {
    installmentPayment: 36,
    interestrate: [21.75],
  },
  {
    installmentPayment: 48,
    interestrate: [21.75],
  },
  {
    installmentPayment: 60,
    interestrate: [21.75],
  },
  {
    installmentPayment: 72,
    interestrate: [22],
  },
  {
    installmentPayment: 80,
    interestrate: [22, 22.75],
  },
];
app.get("/listinterestrateandinstallmentPayment", async (req, res) => {
  const listArr = listinstallmentPayment;
  console.log(listArr);
  return res.send(listArr);
});
app.get("/interestrate/installmentPayment", async (req, res) => {
  const { installmentPayment } = req.query;
  const listArr = listinstallmentPayment.find(
    (item) => item.installmentPayment == installmentPayment
  ).interestrate;
  console.log(listArr);
  return res.send(listArr);
});

const calculateinterestrate = (
  principalAmount,
  interestrate,
  installmentPayment
) => {
  const arrCard1 = [];
  const arrCard2 = [];
  const arrCard3 = [];

  if (installmentPayment >= 12 && installmentPayment <= 24) {
    for (
      installmentPayment = 12;
      installmentPayment <= 24;
      installmentPayment += 6
    ) {
      if (installmentPayment === 12) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard1.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      } else if (installmentPayment === 18) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard2.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      } else if (installmentPayment === 24) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard3.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      }
    }
  }

  if (installmentPayment >= 36 && installmentPayment <= 60) {
    for (
      installmentPayment = 36;
      installmentPayment <= 60;
      installmentPayment += 6
    ) {
      if (installmentPayment === 36) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard1.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      } else if (installmentPayment === 48) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard2.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      } else if (installmentPayment === 60) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard3.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      }
    }
  }

  if (installmentPayment >= 72 && installmentPayment <= 80) {
    for (
      installmentPayment = 72;
      installmentPayment <= 80;
      installmentPayment += 8
    ) {
      if (installmentPayment === 72) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard1.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      } else if (installmentPayment === 80) {
        const result =
          ((((principalAmount * interestrate) / 100) * installmentPayment) /
            12 +
            principalAmount) /
          installmentPayment;
        arrCard2.push({
          installmentPayment: installmentPayment,
          result: result,
        });
      }
    }
  }

  const cardObject = {
    arrCard1,
    arrCard2,
  };

  if (arrCard3.length > 0) {
    cardObject.arrCard3 = arrCard3;
  }

  console.log(cardObject);

  return JSON.stringify(cardObject);
};

// const calTotal = (price, pers) => {
//   let strArr = price.split(",");
//   let strArr2 = pers.split(",");
//   let data = "";
//   let data2 = "";
//   for (let i = 0; i < strArr.length; i++) {
//     data += strArr[i];
//   }
//   for (let i = 0; i < strArr2.length; i++) {
//     data2 += strArr2[i];
//   }
//   return (parseFloat(data) * parseFloat(data2)) / 100;
// };

// const SelectAllElements4 = async (params, caryear) => {
//   const sql = `SELECT PRICE ,PERS_LEASING FROM car_show3 WHERE MDDT_CODE='${params}' AND CAR_YEAR=${caryear} `;
//   return new Promise((resolve, reject) => {
//     db.query(sql, async (error, elements) => {
//       if (error) {
//         return reject(error);
//       }
//       const result = await Promise.all(elements);
//       console.log("ราคากลาง"+result[0].PRICE);

//       console.log("เปอร์เซ็นยอดที่จัดได้"+result[0].PERS_LEASING);
//       console.log(
//         "แสดงยอดจัดได้ : " + calTotal(result[0].PRICE, result[0].PERS_LEASING)
//       );

//       //const Total = (number( result[0].PRICE )* number(result[0].PERS_LEASING )) / 100
//       // console.log(Total)
//       return resolve(elements);
//     });
//   });
// };
