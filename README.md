# TURISMOMZA

Este repositorio contiene la API de turismo para la provincia de Mendoza, Argentina. A continuación, encontrarás las instrucciones para levantar la base de datos PostgreSQL y la API localmente utilizando Docker.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado y en funcionamiento.
- [Docker Compose](https://docs.docker.com/compose/install/) instalado (viene con Docker Desktop).

## Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git https://github.com/lucasggonzalez94/turismomza-be.git
cd turismomza-be
```

### 2. Configurar el Archivo .env

Crea un archivo .env en la raíz del proyecto con la siguiente configuración:

```bash
# URL de conexión a la base de datos PostgreSQL
DATABASE_URL=postgresql://<usuario>:<contraseña>@localhost:5432/<nombre_base_datos>

# Secreto para el token de acceso (JWT)
ACCESS_TOKEN_SECRET=<secreto_jwt>

# Puerto en el que se ejecuta la aplicación
PORT=3001

# Credenciales de la base de datos PostgreSQL
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=<db_name>

# Credenciales de Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# API Key Clarifai
CLARIFAI_API_KEY=<your_api_key>

# Paypal
PAYPAL_CLIENT_ID=<your_client_id>
PAYPAL_CLIENT_SECRET=<your_client_secret>

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=<your-access-token>

# Email
EMAIL_USER=turismomzacontact@gmail.com
EMAIL_PASSWORD=<your_password>
```

### 4. Conectar Prisma a la Base de Datos

Una vez que el contenedor esté en funcionamiento, asegúrate de que Prisma esté configurado para usar la URL de conexión en el archivo .env. Luego, ejecuta las migraciones para crear las tablas en la base de datos:

```bash
npx prisma migrate dev
```

### 5. Levantar el servidor localmente

```bash
npm run dev
```
