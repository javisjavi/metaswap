# MetaSwap

MetaSwap es una aplicación web creada con [Next.js](https://nextjs.org/) que permite realizar swaps de tokens dentro de la red devnet de Solana utilizando la wallet de Solflare y las cotizaciones que ofrece la API pública de Jupiter. El objetivo del proyecto es ofrecer una experiencia simple para que cualquier persona pueda probar intercambios de tokens sin necesidad de usar fondos reales.

---

## Tabla de contenidos
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución del proyecto](#ejecución-del-proyecto)
- [Despliegue](#despliegue)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Uso de la aplicación](#uso-de-la-aplicación)
- [Descripción de pantallas](#descripción-de-pantallas)
- [Scripts disponibles](#scripts-disponibles)
- [Resolución de problemas comunes](#resolución-de-problemas-comunes)
- [Recursos adicionales](#recursos-adicionales)

---

## Requisitos

Antes de comenzar asegúrate de tener instalado lo siguiente:

| Herramienta | Versión recomendada | Cómo comprobar |
|-------------|---------------------|----------------|
| [Node.js](https://nodejs.org/) | 18.x o superior | `node -v` |
| [pnpm](https://pnpm.io/) | 8.x o superior | `pnpm -v` |

> **Consejo:** Si no cuentas con pnpm instalado puedes hacerlo ejecutando `npm install -g pnpm`.

---

## Instalación

1. Clona el repositorio o descarga el código fuente.
2. Abre una terminal en la carpeta del proyecto.
3. Instala las dependencias con el comando:
   ```bash
   pnpm install
   ```
   Este proceso puede tardar unos minutos la primera vez, ya que se descargan todas las librerías necesarias.

---

## Variables de entorno

Algunas funcionalidades requieren configurar variables de entorno en un archivo `.env.local` en la raíz del proyecto. Puedes crear el archivo copiando el ejemplo de abajo:

```bash
cp .env.example .env.local
```

Si no existe un archivo de ejemplo, crea uno nuevo con el siguiente contenido mínimo:

```dotenv
NEXT_PUBLIC_JUPITER_API_BASE_URL=https://quote-api.jup.ag
```

| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| `NEXT_PUBLIC_JUPITER_API_BASE_URL` | URL base del API de Jupiter utilizado para obtener cotizaciones. Cambia este valor si necesitas apuntar a un mirror accesible desde tu red. | `https://quote-api.jup.ag` |

Tras modificar el archivo `.env.local`, reinicia el servidor de desarrollo para que los cambios tengan efecto.

---

## Ejecución del proyecto

1. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
2. Abre tu navegador y visita [http://localhost:3000](http://localhost:3000).
3. Cada vez que cambies código, la página se actualizará automáticamente.

> **Nota:** si es la primera vez que trabajas con Next.js, recuerda que el servidor debe permanecer ejecutándose en la terminal mientras utilizas la aplicación.

Para generar una versión optimizada para producción puedes usar:

```bash
pnpm build
pnpm start
```

`pnpm build` crea los archivos optimizados y `pnpm start` inicia un servidor listo para desplegarse.

---

## Despliegue

### Entorno de desarrollo gestionado (sandbox o staging)

1. Asegúrate de tener las variables del archivo `.env.local` configuradas. Para entornos compartidos puedes usar gestores como [Doppler](https://www.doppler.com/) o [1Password](https://1password.com/).
2. Ejecuta un build limpio para evitar inconsistencias locales:
   ```bash
   pnpm install
   pnpm build
   ```
3. Sube los artefactos a tu plataforma de preproducción (por ejemplo, Vercel, Netlify o un servidor propio). Si usas Vercel:
   ```bash
   vercel --env NEXT_PUBLIC_JUPITER_API_BASE_URL=https://quote-api.jup.ag
   ```
   - El comando anterior desplegará una vista previa (`Preview Deployment`).
   - Comparte la URL generada con QA o stakeholders para validar la funcionalidad.
4. Cada vez que hagas push a una rama, Vercel generará automáticamente un nuevo preview. Revisa los logs en la sección "Deployments" para detectar errores de compilación.

### Entorno de producción

1. **Revisión previa:** valida que los despliegues de preview estén aprobados y que las pruebas de regresión se hayan completado.
2. **Configura las variables:** en el panel de tu proveedor define `NEXT_PUBLIC_JUPITER_API_BASE_URL` apuntando al endpoint que usarás en producción (puede ser el mismo de devnet u otro si migras a mainnet).
3. **Despliega la rama principal:**
   - En Vercel, haz clic en "Promote to Production" desde el deployment aprobado o ejecuta:
     ```bash
     vercel --prod
     ```
   - En un servidor propio, copia los archivos generados en `.next` y ejecuta `pnpm start` detrás de un proxy inverso como Nginx.
4. **Monitoreo post-despliegue:** verifica los logs en la plataforma y realiza un swap de prueba para confirmar la conectividad con la wallet de Solflare y la API de Jupiter.

> **Sugerencia:** Automatiza estos pasos usando pipelines de CI/CD (GitHub Actions, GitLab CI, etc.) para mantener un flujo de despliegue consistente y auditable.

---

## Estructura del proyecto

```
.
├── public/          # Recursos estáticos como iconos e imágenes
├── src/
│   ├── app/         # Páginas y rutas de la aplicación Next.js
│   ├── components/  # Componentes reutilizables de la interfaz
│   ├── lib/         # Utilidades y configuración compartida
│   └── styles/      # Estilos globales
├── package.json     # Dependencias y scripts de npm/pnpm
├── pnpm-lock.yaml   # Bloqueo de versiones para reproducibilidad
└── README.md        # Este documento
```

Esta organización facilita ubicar el código asociado a cada parte de la aplicación.

---

## Uso de la aplicación

1. **Conectar la wallet:** al ingresar, pulsa el botón “Connect Wallet” y elige Solflare. Si no tienes una, puedes crearla siguiendo el asistente que se abrirá en una nueva pestaña.
2. **Solicitar SOL de prueba:** utiliza el botón de faucet para recibir SOL de devnet y poder realizar swaps sin arriesgar fondos reales.
3. **Buscar tokens:** escribe el nombre o dirección del token que deseas intercambiar. El token BONK está disponible mediante su dirección oficial.
4. **Revisar cotizaciones:** MetaSwap consulta automáticamente la API de Jupiter para mostrar el precio estimado. Los datos se actualizan en tiempo real.
5. **Confirmar el swap:** revisa el resumen de la operación (saldo disponible, importe a recibir y comisiones) antes de confirmar.

> **Importante:** Todos los intercambios se realizan en la red **devnet** de Solana, por lo que no involucran fondos reales ni afectarán tus activos en mainnet.

---

## Descripción de pantallas

### Pantalla principal (Dashboard de swaps)

- **Header:** contiene el nombre del proyecto y el botón "Connect Wallet". Este botón abre el modal del Solana Wallet Adapter con todas las wallets disponibles. Una vez conectada la wallet, muestra el estado de la conexión y permite desconectar.
- **Selector de tokens:** dos campos desplegables para elegir el token de origen y destino. Incluyen búsqueda incremental y muestran el balance disponible en la wallet para cada token.
- **Campo de monto:** campo numérico donde el usuario ingresa la cantidad a intercambiar. El componente valida que el saldo sea suficiente y muestra mensajes de error si no lo es.
- **Detalle de la cotización:** panel lateral que indica el precio de referencia, las comisiones estimadas, la ruta utilizada por Jupiter y el total neto a recibir. Se actualiza automáticamente al cambiar tokens o monto.
- **Botón de confirmación:** botón principal "Swap" que, al hacer clic, ejecuta la transacción en devnet. Antes de enviarla, se muestra una confirmación con el resumen de la operación.
- **Faucet de SOL:** banner informativo con un botón que solicita 1 SOL de devnet mediante la API de faucet oficial. Incluye indicadores de éxito/error para que el usuario entienda el resultado.

### Pantalla de errores y estados vacíos

- **Modal de error de wallet:** aparece si la conexión con Solflare falla o si el usuario cancela la firma. Explica los pasos para reintentar o verificar que la wallet esté desbloqueada.
- **Estado sin cotizaciones:** cuando Jupiter no devuelve rutas, se muestra un mensaje con sugerencias (cambiar el par de tokens, reducir el monto o intentar más tarde).
- **Loader de transacción:** un spinner ocupa la tarjeta principal mientras la transacción está pendiente, mostrando mensajes intermedios: "Solicitando cotización", "Esperando firma", "Enviando transacción".

### Modal de confirmación

- Detalla el token de origen, token destino, monto, comisión y hash de transacción. Incluye un enlace para abrir el hash en [Solana Explorer](https://explorer.solana.com/?cluster=devnet). Tras confirmar, el modal se cierra automáticamente y la pantalla principal actualiza los balances.

> **Consejo de UX:** si planeas extender el proyecto, considera añadir un historial de swaps y notificaciones persistentes para mejorar la trazabilidad de las operaciones.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo con recarga automática. |
| `pnpm build` | Genera una versión optimizada lista para producción. |
| `pnpm start` | Ejecuta el servidor en modo producción (requiere haber corrido `pnpm build`). |
| `pnpm lint` | Ejecuta las reglas de ESLint para mantener un código consistente. |

---

## Resolución de problemas comunes

- **El comando `pnpm dev` no se ejecuta:** asegúrate de tener Node.js 18 o superior. Puedes usar [nvm](https://github.com/nvm-sh/nvm) para gestionar múltiples versiones.
- **No puedo conectarme a Solflare:** revisa que la extensión o aplicación de Solflare esté instalada y desbloqueada. Si estás en modo incógnito, habilita las extensiones.
- **No aparecen cotizaciones:** puede que el endpoint `https://quote-api.jup.ag` esté temporalmente bloqueado en tu red. Cambia la variable de entorno `NEXT_PUBLIC_JUPITER_API_BASE_URL` a otro mirror disponible.
- **Errores al instalar dependencias:** elimina la carpeta `node_modules` y el archivo `pnpm-lock.yaml`, luego vuelve a ejecutar `pnpm install`.

---

## Recursos adicionales

- [Documentación de Solana](https://solana.com/docs)
- [Wallet Adapter de Solana](https://github.com/solana-labs/wallet-adapter)
- [Documentación de Solflare](https://solflare.com/)
- [Jupiter Aggregator API](https://station.jup.ag/docs)
- [Guía oficial de Next.js](https://nextjs.org/docs)

Si tienes dudas o sugerencias, abre un issue en el repositorio o envía un pull request. ¡Tu retroalimentación es bienvenida!

