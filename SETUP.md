# 🎯 Guía de Configuración y Uso - English Tutor

## ⚡ Configuración Rápida

### 1. Configura tu API Key de OpenAI

**IMPORTANTE:** Esta app requiere una API key de OpenAI configurada en Rork.

#### En Rork:
1. Ve a **Integrations → Environment Variables**
2. Añade:
   - **Key:** `EXPO_PUBLIC_OPENAI_API_KEY`
   - **Value:** Tu clave de OpenAI (empieza con `sk-...`)
3. **Reinicia** el servidor de desarrollo

#### Obtener tu API Key:
1. Ve a [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crea una nueva clave secreta
3. Copia la clave completa

---

## 📱 Cómo ejecutar la app

### En iPhone/Android (RECOMENDADO)

**⚠️ Esta app SOLO funciona en dispositivo físico, NO en web**

1. **Descarga Expo Go:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Inicia el servidor:**
   ```bash
   bun run start
   ```

3. **Escanea el QR:**
   - iOS: Abre la cámara → Apunta al QR
   - Android: Abre Expo Go → Usa el scanner

---

## 🎯 Flujo de uso

1. **Pantalla principal:** Selecciona un tutor
2. **Pre-llamada:** Configura estilo e idioma (solo la primera vez)
3. **Llamada activa:**
   - El tutor te saluda primero
   - Habla naturalmente en inglés o español
   - El tutor responde en tiempo real
   - Los subtítulos muestran lo que dice
4. **Calificación:** Evalúa la experiencia

---

## 🔍 Verificación técnica

### Logs esperados:

```bash
🔑 API KEY LENGTH: 51
✅ API key loaded
🔌 Connecting to OpenAI Realtime API...
✅ WebSocket connected successfully
✅ Session update sent
✅ Triggered initial greeting
🎵 Received audio delta, length: 1234
🎤 User started speaking
🎤 User stopped speaking
```

---

## 🚨 Troubleshooting

### ❌ "API key not loaded"
- Verifica que `EXPO_PUBLIC_OPENAI_API_KEY` esté en Rork Integrations
- Reinicia el servidor de desarrollo
- Confirma que la clave empiece con `sk-`

### ❌ "WebSocket error"
- Verifica tu conexión a internet
- Confirma que tu API key sea válida en [platform.openai.com](https://platform.openai.com/account/api-keys)
- Revisa que tengas créditos disponibles

### ❌ No escucho respuestas
- Verifica permisos del micrófono
- Confirma que el volumen esté alto
- Revisa los logs: debe aparecer "🎵 Received audio delta"
- Asegúrate de estar en dispositivo físico (no web)

### ❌ "Realtime voice only funciona en dispositivo físico"
- Esta app NO funciona en navegador
- Usa Expo Go en iPhone o Android

---

## 📂 Archivos clave

```
hooks/useRealtimeCall.ts      # Lógica WebSocket + Audio
app/call.tsx                   # Pantalla de llamada
constants/tutors.ts            # Configuración de tutores
providers/AppStateProvider.tsx # Estado global
```

---

## 🔧 Comandos útiles

```bash
# Instalar dependencias
bun install

# Iniciar servidor
bun run start

# Limpiar cache
bunx expo start --clear
```

---

## ✅ Correcciones implementadas

### 1. WebSocket simplificado y corregido
- ✅ URL correcta sin duplicados
- ✅ Headers de autenticación en formato React Native
- ✅ Validación simple de API key
- ✅ Bloqueo en web con mensaje claro

### 2. Validación de API key mejorada
- ✅ Log de longitud de la clave
- ✅ Verificación antes de throw error
- ✅ Sin código después de return

### 3. Formato de audio correcto
- ✅ Envío: `{ type: "input_audio_buffer.append", audio: base64 }`
- ✅ Recepción: Decodificación de `response.audio.delta`
- ✅ Conversión PCM16 → WAV → reproducción con expo-av

### 4. Reproducción por speakers
- ✅ `playThroughEarpieceAndroid: false`
- ✅ `playsInSilentModeIOS: true`
- ✅ Audio por altavoces, no auricular

---

## 📊 Flujo técnico

```
1. startCall() → Conecta WebSocket + Inicia grabación
2. WebSocket.onopen → Envía session.update con configuración
3. Grabación → Envía chunks de audio cada 250ms
4. OpenAI → Detecta habla (server VAD)
5. response.audio.delta → Recibe audio en streaming
6. playAudioChunk() → PCM16 → WAV → expo-av
7. endCall() → Limpia recursos
```

---

## 🎓 Tecnologías

- **OpenAI Realtime API** - Conversaciones de voz en tiempo real
- **WebSocket** - Comunicación bidireccional
- **expo-av** - Grabación y reproducción
- **React Native + Expo** - Framework mobile
- **Expo Router** - Navegación file-based

---

## ⚙️ Configuración de OpenAI Realtime

```typescript
session: {
  modalities: ["text", "audio"],
  voice: "alloy",
  input_audio_format: "pcm16",
  output_audio_format: "pcm16",
  turn_detection: {
    type: "server_vad",
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 500,
  }
}
```

---

**¡Listo para practicar inglés! 🚀**

Si tienes problemas, revisa los logs en la terminal y verifica que tu API key esté configurada correctamente en Rork.
