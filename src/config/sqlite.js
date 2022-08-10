const { Op } = require("sequelize");
const { resolve } = require("path");
const krypto = require("crypto");

require("dotenv").config({
  path: resolve(__dirname, "../../.env"),
});

let encryptedTimes = false;
// TODO botar as funções no arquivos certos e aprender a usar sequelize com es6
// Chaves de criptografia
const { ENC_KEY, IV } = process["env"];

/**
 * Função para criptografar dados
 * @param {*} val Valor a ser encriptografado
 * @returns Valor criptografado
 */
const encrypt = val => {
  const cipher = krypto.createCipheriv("aes-256-cbc", ENC_KEY, IV);
  let encrypted = cipher.update(val, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

/**
 * Função para descriptografar dados
 * @param {*} encrypted Valor a ser descriptografado
 * @returns Valor descriptografado
 */
const decrypt = encrypted => {
  try {
    const decipher = krypto.createDecipheriv("aes-256-cbc", ENC_KEY, IV);
    const decrypted = decipher.update(encrypted, "hex", "utf8");
    return decrypted + decipher.final("utf8");
  } catch (error) {
    return encrypted;
  }
};

// Função resposável por encontrar dados no banco Sqlite criptografado
// Utilizada nos hooks SQLite
const findCryptoTarget = async (data, encrypted) => {
  if (typeof data === "string") {
    if (encrypted) {
      data = decrypt(data);
    } else {
      data = encrypt(data);
    }
  } else {
    for (const key in data) {
      if (typeof data[key] === "string" && data[key] !== null) {
        if (encrypted) {
          data[key] = decrypt(data[key]);
        } else {
          data[key] = encrypt(data[key]);
        }
      } else if (
        typeof data[key] === "object" &&
        data[key] !== null &&
        key !== "_options" &&
        key !== "_changed" &&
        key !== "options" &&
        key !== "rawAttributes" &&
        key !== "_previousDataValues"
      ) {
        if (data[key]) {
          try {
            data[key] = await findCryptoTarget(data[key], encrypted);
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  }
  return data;
};

// Modulo responsável por Config de conexão com o banco SQL
module.exports = {
  dialect: "sqlite",
  storage: resolve(__dirname, "..", "database", "dbxmonitor.sqlite3"),
  define: {
    timestamps: true,
    underscored: true,
    hooks: {
      async beforeFind(data) {
        //  Criptografa o dado antes de acha-lo no banco
        if (data["where"]) {
          data["where"] = await findCryptoTarget(data["where"], false);

          for (const option in Op) {
            if (Array.isArray(data)) {
              if (data[0]["dataValues"]["name"] && !data[0]["dataValues"]["name"].includes(".js")) {
                data = await findCryptoTarget(data, true);
              }
            }
            if (data["where"][Op[option]]) {
              data["where"][Op[option]] = await findCryptoTarget(data["where"][Op[option]], false);
            }
          }
        }
        for (const index in data["include"]) {
          if (data["include"][index]["where"]) {
            data["include"][index]["where"] = await findCryptoTarget(data["include"][index]["where"], false);
          }
        }
      },

      async beforeCreate(data) {
        if (!encryptedTimes) {
          if (!data["dataValues"]["name"] || !data["dataValues"]["name"].includes(".js")) {
            data["dataValues"] = await findCryptoTarget(data["dataValues"], false);
          }
        }
        encryptedTimes = true;
      },

      beforeUpdate() {},

      async beforeBulkUpdate(data) {
        if (data["attributes"]) {
          data["attributes"] = await findCryptoTarget(data["attributes"], false);
        }
        if (data["where"]) {
          data["where"] = await findCryptoTarget(data["where"], false);
        }
        for (const option in Op) {
          if (data["where"][Op[option]]) {
            data["where"][Op[option]] = await findCryptoTarget(data["where"][Op[option]], false);
          }
        }
      },

      beforeDestroy() {},

      async beforeBulkDestroy(data) {
        if (data["where"]) {
          if (!data["where"]["name"] || !data["where"]["name"].includes(".js")) {
            data["where"] = await findCryptoTarget(data["where"], false);
          }
        }
      },

      async afterFind(data) {
        // Descriptografa os dados do banco para envia-los ao usuário
        if (data) {
          if (Array.isArray(data) && data.length) {
            if (!data[0]["dataValues"]["name"] || !data[0]["dataValues"]["name"].includes(".js")) {
              for (const index in data) {
                data[index]["dataValues"] = await findCryptoTarget(data[index]["dataValues"], true);
              }
            }
          } else if (data["dataValues"]) {
            data["dataValues"] = await findCryptoTarget(data["dataValues"], true);
          }
        }
      },

      afterCreate() {
        encryptedTimes = false;
      },

      afterUpdate() {},

      afterBulkUpdate() {
        encryptedTimes = false;
      },

      afterDestroy() {},

      afterBulkDestroy() {},
    },
  },
  logging: false,
};
