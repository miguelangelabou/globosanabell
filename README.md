# Globosanabell

Este es el repositorio para el proyecto Globosanabell, una aplicación web construida con Next.js, React y Firebase. La aplicación esta diseñada para gestionar ventas, productos y empresas, e incluye un panel de administración.

## Comenzando

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

### Prerrequisitos

Necesitarás tener Node.js y npm (o yarn/pnpm) instalados en tu máquina.

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/globosanabell.git
    cd globosanabell
    ```

2.  **Instala las dependencias:**
    Usa tu gestor de paquetes preferido para instalar las dependencias del proyecto.
    ```bash
    npm install
    # o
    yarn install
    # o
    pnpm install
    ```

3.  **Configura las variables de entorno:**
    - Crea una copia del archivo `.env.example` y renómbrala a `.env.local`.
      ```bash
      cp .env.example .env.local
      ```
    - Abre el archivo `.env.local` y reemplaza los valores de ejemplo con tus propias credenciales de Firebase. Puedes encontrar estas credenciales en la consola de tu proyecto de Firebase.

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`

Ejecuta la aplicación en modo de desarrollo con Turbopack.
Abre [http://localhost:3000](http://localhost:3000) para verla en tu navegador.

La página se recargará automáticamente si haces cambios en el código.

### `npm run build`

Construye la aplicación para producción en la carpeta `.next`.

### `npm run start`

Inicia un servidor de producción de Next.js. Debes ejecutar `npm run build` antes de usar este comando.

### `npm run lint`

Ejecuta el linter para revisar el código en busca de problemas.

## Tecnologías Utilizadas

-   **[Next.js](https://nextjs.org/)** - El framework de React para producción.
-   **[React](https://reactjs.org/)** - La librería para construir interfaces de usuario.
-   **[TypeScript](https://www.typescriptlang.org/)** - Un superconjunto tipado de JavaScript.
-   **[Firebase](https://firebase.google.com/)** - Utilizado para la autenticación y la base de datos (Firestore).
-   **[Tailwind CSS](https://tailwindcss.com/)** - Un framework de CSS "utility-first".
