# Versao do node que vai rodar no Docker
FROM node:alpine

# Diretorio de trabalho
WORKDIR /usr/app

# Copia tudo que tiver começo package e final .json p/ a pasta WorkDir
COPY package*.json ./
COPY yarn.lock ./
# Comando de execução
RUN npm install

COPY . .


# Porta que o servidor precisa expor para a maquina local poder acessar
EXPOSE 3000

# Deve ser unica por Dockerfile
# Propriedade que diz qual o comando deve ser usado para que a aplicação entre no ar
CMD ["npm", "start"]
