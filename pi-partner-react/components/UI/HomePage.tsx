import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useChatHistory } from './ChatHistoryProvider';
import { useNavigation } from '@react-navigation/native';

const HomePage = () => {
  const [problem, setProblem] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { addChatHistory } = useChatHistory(); // Use the custom hook here
  const navigation = useNavigation();

  const submitProblem = async () => {
    setIsLoading(true);
    try {
      // Simulating API response
      const explanation = `Explanation for: ${problem}`;
      setResponse(explanation);
      addChatHistory({ problem, explanation });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PiPartner</Text>
      <ScrollView style={styles.body}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Text style={styles.response}>{response}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Type your problem here"
          value={problem}
          onChangeText={setProblem}
        />
        <Button title="Submit" onPress={submitProblem} />
        <TouchableOpacity
          style={styles.historyButton}
        >
          <Text style={styles.historyText}>Go to Chat History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  body: { marginTop: 20 },
  response: { fontSize: 16, marginBottom: 20 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 20 },
  historyButton: { marginTop: 20, alignItems: 'center', backgroundColor: '#007bff', padding: 10 },
  historyText: { color: 'white' },
});

export default HomePage;