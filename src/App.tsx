import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import useWspClient from './hooks/useWspClient';
import { SenderCargo, simpleMessage } from './ws-bot/bot';
import { FormInput, useWspSession } from './ws-bot/types';

//TRY TO MAKE THE APP FUNCTION TO SHOW CONTENT FROM A TEXT FILE AT THE SERVER

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface AppSetters {
  setLastMessage: SetState<simpleMessage|undefined>,
  setPairingCode: SetState<string>,
  setStatus: SetState<string>
}

function handleSessionChange (session: useWspSession, setters: AppSetters) {
  const { isFetched, clientData } = session;
  const { STATE, PAIRING_CODE, MESSAGE } = SenderCargo;
  const { setStatus, setPairingCode, setLastMessage } = setters;
  if (!isFetched) return;

  switch(clientData.cargo) {
    case STATE: {
      if (typeof clientData.package === "string") {
        setStatus(clientData.package)
      }
    } break;
    case PAIRING_CODE: {
      console.log(clientData)
      if (typeof clientData.package === "string") {
        setPairingCode(clientData.package)
      }
    } break;
    case MESSAGE: {
      if (typeof clientData.package !== "string") {
        setLastMessage(clientData.package as simpleMessage)
      }
    } break;
  }
}


export default function App() {
  
  const [ clientName, setClientName ] = useState("")
  const [ lastMessage, setLastMessage ] = useState<simpleMessage|undefined>()
  const [ pairingCode, setPairingCode ] = useState("")
  const [ status, setStatus ] = useState("")
  const [ phoneNumber, setPhoneNumber ] = useState<undefined|string>()
  
  const session = useWspClient(clientName, phoneNumber);
    
  useEffect(() => {
    handleSessionChange(
      session,
      {
        setLastMessage,
        setPairingCode,
        setStatus
      }
    )
  }, [session])
  
  return (
    <View style={styles.container}>
      <Form isFetched={session.isFetched} onSubmit={(data: FormInput) => {
        setClientName(data.username)
        setPhoneNumber(data.phoneNumber || undefined)
      }}/>
      <Text style={styles.status}>{status}</Text>
      {
        lastMessage ? 
        <Text>
          Last message ({lastMessage.from}): {lastMessage.body}
        </Text> :

        pairingCode &&
        <Text selectable>
          Your Pairing Code Is: {pairingCode} 
        </Text>
      }
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
          <Text>Coloca tu número de teléfono aquí:</Text>
          <TextInput placeholder='Número de teléfono' onChangeText={setPhoneNumber} value={phoneNumber}/>
        </>
      }
      <Button title="Submit" onPress={() => {
        onSubmit({
          username,
          phoneNumber
        })
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
