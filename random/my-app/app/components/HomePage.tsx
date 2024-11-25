import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import {
  Button,
  TextInput,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { ChatHistoryContext } from '../context/ChatHistoryProvider';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function HomePage({ navigation }: { navigation: any }) {
  const [problem, setProblem] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [detectedProblem, setDetectedProblem] = useState<string | null>(null);

  const chatHistoryContext = useContext(ChatHistoryContext);

  const submitProblem = async (isConfirmation: boolean = false) => {
    const apiUrl =
      'https://7fbky3fph0.execute-api.us-east-1.amazonaws.com/dev/math';
    setIsLoading(true);
    setResponse('');

    try {
      let requestBody: any = {
        input_type: 'text',
        problem: problem,
        ocr_confirmation: isConfirmation,
      };

      if (selectedFileUri && !isConfirmation) {
        const fileBase64 = await FileSystem.readAsStringAsync(selectedFileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        requestBody = {
          input_type: 'image',
          image_data: fileBase64,
        };
      }

      const result = await axios.post(apiUrl, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (result.status === 200) {
        const responseJson = result.data.body
          ? JSON.parse(result.data.body)
          : result.data;

        if (responseJson.requires_confirmation) {
          setDetectedProblem(responseJson.problem);
          setProblem(responseJson.problem || '');
          setResponse(
            responseJson.explanation || 'Is this correct? Please confirm.'
          );
          setRequiresConfirmation(true);
        } else {
          setResponse(responseJson.explanation || 'No explanation provided.');
          setRequiresConfirmation(false);
          setDetectedProblem(null);
        }

        // Add to chat history
        chatHistoryContext?.addChat({
          id: Date.now().toString(),
          message: responseJson.explanation || 'N/A',
        });
      } else {
        setResponse(`Error: ${result.status} - ${result.data}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      if (!requiresConfirmation) setSelectedFileUri(null);
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedFileUri(result.uri);
      setProblem('');
      await submitProblem();
    }
  };

  const pickFileFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedFileUri(result.uri);
      setProblem('');
      await submitProblem();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Image
            source={require('../assets/logo.jpg')} // Replace with your logo path
            style={styles.logo}
          />
          <Title style={styles.title}>Welcome to PiPartner!</Title>
          <Paragraph style={styles.subtitle}>
            Solve your problems by typing or uploading an image.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Response Section */}
      <Card style={styles.responseCard}>
        <Card.Content>
          {isLoading ? (
            <ActivityIndicator animating={true} size="large" color="#6200ea" />
          ) : (
            <Paragraph style={styles.responseText}>
              {response || 'Enter a problem to see the response here.'}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Input Section */}
      <TextInput
        label={
          requiresConfirmation
            ? 'Edit the detected problem if necessary'
            : 'Enter your problem'
        }
        value={problem}
        onChangeText={setProblem}
        mode="outlined"
        style={styles.input}
      />

      {/* Buttons */}
      <Button
        mode="contained"
        onPress={() => submitProblem(requiresConfirmation)}
        style={styles.submitButton}
        icon={requiresConfirmation ? 'check' : 'send'}>
        {requiresConfirmation ? 'Confirm Problem' : 'Submit Problem'}
      </Button>
      <Button
        mode="outlined"
        onPress={pickFileFromGallery}
        style={styles.uploadButton}
        icon="file-upload">
        Upload from Gallery
      </Button>
      <Button
        mode="outlined"
        onPress={pickImageFromCamera}
        style={styles.cameraButton}
        icon="camera">
        Take a Picture
      </Button>

      {/* Selected Image Preview */}
      {selectedFileUri && (
        <Image
          source={{ uri: selectedFileUri }}
          style={styles.selectedImage}
          resizeMode="contain"
        />
      )}

      {/* Navigation Button */}
      <Button
        mode="text"
        onPress={() => navigation.navigate('ChatHistory')}
        style={styles.historyButton}>
        View Chat History
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#6200ea',
    borderRadius: 10,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#ddd',
    fontSize: 14,
    marginBottom: 16,
  },
  responseCard: {
    marginBottom: 16,
    borderRadius: 10,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginBottom: 12,
  },
  uploadButton: {
    marginBottom: 12,
  },
  cameraButton: {
    marginBottom: 12,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 10,
  },
  historyButton: {
    alignSelf: 'center',
  },
});
