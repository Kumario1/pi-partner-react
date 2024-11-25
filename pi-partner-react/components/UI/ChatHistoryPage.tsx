import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useChatHistory } from './ChatHistoryProvider';

const ChatHistoryPage = () => {
  const { chatHistory } = useChatHistory(); // Using the custom hook

  if (!chatHistory || chatHistory.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No chat history available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chatHistory}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.label}>Problem:</Text>
          <Text>{item.problem}</Text>
          <Text style={styles.label}>Explanation:</Text>
          <Text>{item.explanation}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: 'gray' },
  card: { margin: 10, padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#ccc' },
  label: { fontWeight: 'bold', marginTop: 10 },
});

export default ChatHistoryPage;