import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import useWspClient from './hooks/useWspClient';
import { Client, Message } from 'whatsapp-web.js';
import { SenderCargo, SenderPkg } from './ws-bot/bot';

interface FormInput {
  username: string,
  phoneNumber: string
}

export default function App() {
  const [ clientName, setClientName ] = useState("")
  const [ lastMessage, setLastMessage ] = useState({
    from: "",
    content: ""
  })
  const [ pairingCode, setPairingCode ] = useState("")
  const [ status, setStatus ] = useState("")
  const [ phoneNumber, setPhoneNumber ] = useState<undefined|string>()

  const sender = (client: Client, cargo: SenderCargo, pkg: SenderPkg) => {
    let { MESSAGE, PAIRING_CODE, STATE } = SenderCargo
    switch (cargo) {
      case MESSAGE: {
        if (typeof pkg !== "string") {
          setLastMessage({
            from: pkg.from,
            content: pkg.body
          })
          client.sendMessage(pkg.from, "Message Received! :D (sorry I have absolutely nothing to say yet)")
          .then(msj => {
            console.log(`We sended this message to ${msj.to}: '${msj.body}'`)
          })
        }
      } break;
      case PAIRING_CODE: {
        if (typeof pkg === "string") {
          setPairingCode(pkg)
        }
      } break;
      case STATE: {
        if (typeof pkg === "string") {
          setStatus(pkg)
        } break;
      }
    }
  }

  const session = useWspClient(clientName, sender, phoneNumber)

  return (
    <View style={styles.container}>
      <Form isFetched={session.isFetched} onSubmit={(data: FormInput) => {
        setClientName(data.username)
        setPhoneNumber(data.phoneNumber)
      }}/>
      <Text style={styles.status}>{status}</Text>
      <Text>{ 
      lastMessage.from ? 
      `Last message (${lastMessage.from}): ${lastMessage.content}` :
      `Your Pairing Code Is: ${pairingCode}` 
      }</Text>
    </View>
  );
}

function Form ({ onSubmit, isFetched }: { onSubmit: (data: FormInput) => void, isFetched: boolean }) {
  const [ username, setUsername ] = useState("")
  const [ phoneNumber, setPhoneNumber ] = useState("")
  return (
    <>
      <Text>Pon tu nombre de usuario aquí</Text>
      <TextInput placeholder='Nombre de usuario' onChangeText={setUsername} value={username}/>
      {
        !isFetched &&
        <>
          <Text>Uh... No encontramos tu sesión, coloca tu número de teléfono aquí:</Text>
          <TextInput placeholder='Número de teléfono' onChangeText={setPhoneNumber} value={phoneNumber}/>
        </>
      }
      <Button title="Submit" onPress={() => {
        onSubmit({
          username,
          phoneNumber
        })
        setUsername("")
        setPhoneNumber("")
      }}/>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    marginVertical: 5
  }
});
