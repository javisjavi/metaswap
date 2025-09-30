# MetaSwap

Aplicación web construida con Next.js para realizar swaps de tokens en la devnet de Solana utilizando la wallet de Solflare y la
API de Jupiter para cotizaciones.

## Requisitos

- Node.js 18 o superior
- pnpm (se incluye `pnpm-lock.yaml` con las dependencias necesarias)

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

## Características principales

- Conexión con Solflare mediante `@solana/wallet-adapter`.
- Solicitud de SOL de prueba en devnet con un botón de faucet.
- Búsqueda y selección de tokens (incluye BONK por dirección).
- Cotizaciones dinámicas usando Jupiter con actualización automática.
- Visualización del saldo disponible y de la previsualización de la operación antes de confirmar el swap.
