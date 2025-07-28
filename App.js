import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Keyboard, Platform, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voicePreference, setVoicePreference] = useState('american'); // 'american' or 'filipino'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Initialize audio permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to use voice input.');
      }
    })();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch('http://192.168.18.116:5678/webhook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, sessionId:'1' })
      });
      
      const data = await response.json();
      const aiResponseText = data.output || data.message || 'No response received';
      const aiMessage = { 
        id: Date.now() + 1, 
        text: aiResponseText, 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Automatically speak AI response
      speakText(aiResponseText);
      
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        text: '❌ Connection error. Please check your connection and try again.', 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setLoading(false);
  };

  const processTextForSpeech = (text, isFilipino = false) => {
    let processedText = text;

    if (isFilipino) {
      // Enhanced Filipino/Tagalog speech patterns with proper phonetics
      processedText = processedText
        // Fix "ng" pronunciation - the key issue you mentioned
        .replace(/\bng\b/gi, 'nang')
        .replace(/\btang\b/gi, 'tang')
        .replace(/\bkung\b/gi, 'kung')
        .replace(/\byang\b/gi, 'yang')
        .replace(/\bsang\b/gi, 'sang')
        .replace(/\bmang\b/gi, 'mang')
        .replace(/\bbang\b/gi, 'bang')
        .replace(/\blang\b/gi, 'lang')
        .replace(/\bgang\b/gi, 'gang')
        .replace(/\bhang\b/gi, 'hang')
        .replace(/\bpang\b/gi, 'pang')
        .replace(/\brang\b/gi, 'rang')
        .replace(/\bwang\b/gi, 'wang')
        
        // Fix other Filipino phonetic patterns
        .replace(/\btayo\b/gi, 'tah-yo')
        .replace(/\bkayo\b/gi, 'kah-yo')
        .replace(/\bsiya\b/gi, 'shya')
        .replace(/\bsila\b/gi, 'shla')
        .replace(/\bito\b/gi, 'ee-to')
        .replace(/\biyan\b/gi, 'ee-yan')
        .replace(/\biyon\b/gi, 'ee-yon')
        .replace(/\bdito\b/gi, 'dee-to')
        .replace(/\bdoon\b/gi, 'do-on')
        .replace(/\brito\b/gi, 'ree-to')
        .replace(/\broon\b/gi, 'ro-on')
        
        // Natural masculine Filipino greetings and expressions
        .replace(/^Hello\b/gi, 'Hoy, kumusta brad')
        .replace(/^Hi\b/gi, 'Oy, kamusta pre')
        .replace(/^Hey\b/gi, 'Tsong, ano meron')
        .replace(/^Good morning/gi, 'Magandang umaga tsong')
        .replace(/^Good afternoon/gi, 'Magandang hapon pare')
        .replace(/^Good evening/gi, 'Magandang gabi boss')
        
        // Masculine Filipino responses and acknowledgments
        .replace(/\bThank you\b/gi, 'Salamat tsong')
        .replace(/\bThanks\b/gi, 'Salamat pre')
        .replace(/\bYou're welcome\b/gi, 'Walang anuman brad')
        .replace(/\bExcuse me\b/gi, 'Excuse me lang boss')
        .replace(/\bSorry\b/gi, 'Pasensya na pare')
        .replace(/\bYes\b/gi, 'Oo nga')
        .replace(/\bNo\b/gi, 'Hindi naman')
        .replace(/\bOkay\b/gi, 'Sige lang')
        .replace(/\bAlright\b/gi, 'Ayos lang yan')
        
        // Natural Filipino conversation fillers with masculine tone
        .replace(/\bvery good\b/gi, 'galing naman niyan')
        .replace(/\bthat's right\b/gi, 'tama nga yan tsong')
        .replace(/\bthat's correct\b/gi, 'eksakto yan pre')
        .replace(/\bI think\b/gi, 'Sa palagay ko kase')
        .replace(/\bI believe\b/gi, 'Naniniwala ako na')
        .replace(/\bbecause\b/gi, 'kase eh')
        .replace(/\bbut\b/gi, 'pero naman')
        .replace(/\bactually\b/gi, 'actually kase')
        .replace(/\breally\b/gi, 'talaga nga yan')
        .replace(/\bof course\b/gi, 'syempre naman tsong')
        .replace(/\bmaybe\b/gi, 'baka nga')
        .replace(/\bprobably\b/gi, 'siguro nga')
        .replace(/\bdefinitely\b/gi, 'sigurado yan')
        
        // More natural masculine expressions
        .replace(/\bawesome\b/gi, 'galing naman')
        .replace(/\bgreat\b/gi, 'solid yan')
        .replace(/\bwonderful\b/gi, 'ganda naman')
        .replace(/\bexcellent\b/gi, 'perfect yan')
        .replace(/\bamazing\b/gi, 'ang galing naman')
        .replace(/\bincredible\b/gi, 'hindi makapaniwala')
        
        // Tech terms with Filipino pronunciation
        .replace(/\bcomputer\b/gi, 'kom-pyu-ter')
        .replace(/\binternet\b/gi, 'in-ter-net')
        .replace(/\bwebsite\b/gi, 'web-site')
        .replace(/\bemail\b/gi, 'ee-meyl')
        .replace(/\bFacebook\b/gi, 'Feys-buk')
        .replace(/\bGoogle\b/gi, 'Gu-gol')
        .replace(/\bYouTube\b/gi, 'Yu-Tyub')
        .replace(/\bsmartphone\b/gi, 'smart-pon')
        .replace(/\bapplication\b/gi, 'ap-li-key-shun')
        .replace(/\bapp\b/gi, 'app')
        
        // Common words with Filipino context and masculine tone
        .replace(/\bmoney\b/gi, 'pera')
        .replace(/\bfood\b/gi, 'pagkain')
        .replace(/\bwater\b/gi, 'tubig')
        .replace(/\bhouse\b/gi, 'bahay')
        .replace(/\bfamily\b/gi, 'pamilya')
        .replace(/\bfriend\b/gi, 'kaibigan')
        .replace(/\bwork\b/gi, 'trabaho')
        .replace(/\bschool\b/gi, 'eskwelahan')
        
        // Sentence enders with masculine Filipino patterns
        .replace(/\. /g, ' eh. ')
        .replace(/\? /g, ' ba? ')
        .replace(/! /g, ' talaga! ')
        .replace(/right\?/gi, 'tama ba?')
        .replace(/isn't it\?/gi, 'hindi ba?')
        .replace(/you know\?/gi, 'alam mo ba?')
        .replace(/do you understand\?/gi, 'gets mo ba?');
        
    } else {
      // Enhanced American English with natural masculine speech patterns
      processedText = processedText
        // Casual American masculine greetings
        .replace(/^Hello\b/gi, 'Hey there man')
        .replace(/^Hi\b/gi, 'What\'s up dude')
        .replace(/^Hey\b/gi, 'Hey buddy')
        
        // American casual masculine responses
        .replace(/\bYou're welcome\b/gi, 'No problem man')
        .replace(/\bOkay\b/gi, 'Alright')
        .replace(/\bYes\b/gi, 'Yeah definitely')
        .replace(/\bNo\b/gi, 'Nah man')
        
        // Natural American masculine conversation patterns
        .replace(/\bvery good\b/gi, 'pretty solid')
        .replace(/\bthat's right\b/gi, 'exactly right dude')
        .replace(/\bthat's correct\b/gi, 'spot on man')
        .replace(/\bI think\b/gi, 'I figure')
        .replace(/\breally\b/gi, 'totally')
        .replace(/\bactually\b/gi, 'honestly')
        .replace(/\bof course\b/gi, 'absolutely man')
        .replace(/\bmaybe\b/gi, 'probably')
        .replace(/\bdefinitely\b/gi, 'for sure')
        
        // American masculine expressions
        .replace(/\bawesome\b/gi, 'pretty cool')
        .replace(/\bgreat\b/gi, 'solid')
        .replace(/\bwonderful\b/gi, 'fantastic')
        .replace(/\bexcellent\b/gi, 'outstanding')
        .replace(/\bamazing\b/gi, 'incredible man')
        .replace(/\bincredible\b/gi, 'unbelievable dude');
    }

    // Common processing for both accents
    processedText = processedText
      // Add natural masculine pauses and rhythm
      .replace(/\. /g, '... ')
      .replace(/\? /g, '?... ')
      .replace(/! /g, '!... ')
      
      // Handle technical abbreviations with clear pronunciation
      .replace(/\bAI\b/g, 'A I')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bURL\b/g, 'U R L')
      .replace(/\bHTML\b/g, 'H T M L')
      .replace(/\bCSS\b/g, 'C S S')
      .replace(/\bJS\b/g, 'JavaScript')
      .replace(/\bPHP\b/g, 'P H P')
      .replace(/\bSQL\b/g, 'S Q L')
      .replace(/\bJSON\b/g, 'J S O N')
      .replace(/\bXML\b/g, 'X M L')
      .replace(/\bHTTP\b/g, 'H T T P')
      .replace(/\bHTTPS\b/g, 'H T T P S')
      
      // Numbers and symbols with natural pronunciation
      .replace(/(\d+)%/g, '$1 percent')
      .replace(/\$/g, isFilipino ? 'piso ' : 'dollars ')
      .replace(/@/g, 'at ')
      .replace(/&/g, isFilipino ? 'at ' : 'and ')
      .replace(/#/g, isFilipino ? 'hashtag ' : 'hash ')
      .replace(/\+/g, 'plus ')
      .replace(/=/g, 'equals ')
      .replace(/</g, 'less than ')
      .replace(/>/g, 'greater than ')
      
      // Remove markdown and formatting that interfere with speech
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, 'code block')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      
      // Handle emoticons and symbols naturally
      .replace(/:\)/g, '')
      .replace(/:\(/g, '')
      .replace(/😊/g, '')
      .replace(/😂/g, '')
      .replace(/🤔/g, '')
      .replace(/👍/g, '')
      .replace(/❌/g, isFilipino ? 'May error: ' : 'Error: ')
      .replace(/✅/g, isFilipino ? 'Success: ' : 'Success: ')
      .replace(/⚠️/g, isFilipino ? 'Warning: ' : 'Warning: ')
      .replace(/🔥/g, isFilipino ? 'sulit yan: ' : 'awesome: ')
      .replace(/💪/g, isFilipino ? 'malakas yan: ' : 'strong: ')
      
      // Clean up spacing and formatting
      .replace(/\s+/g, ' ')
      .replace(/\.{2,}/g, '.')
      .trim();

    return processedText;
  };

  const selectOptimalVoice = async (preferFilipino = false) => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices.map(v => ({ name: v.name, language: v.language, quality: v.quality })));
      
      if (preferFilipino) {
        // Look for Filipino/Tagalog voices first
        const filipinoVoices = voices.filter(voice => 
          voice.language.includes('tl') || 
          voice.language.includes('fil') ||
          voice.language.includes('ph') ||
          voice.name.toLowerCase().includes('filipino') ||
          voice.name.toLowerCase().includes('tagalog')
        );
        
        if (filipinoVoices.length > 0) {
          // Prefer male Filipino voices
          const maleFilipino = filipinoVoices.find(voice => 
            voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('man') ||
            voice.name.toLowerCase().includes('boy') ||
            voice.name.toLowerCase().includes('angelo') ||
            voice.name.toLowerCase().includes('carlos')
          );
          if (maleFilipino) return maleFilipino;
          return filipinoVoices[0];
        }
        
        // If no Filipino voices, use English male voices with deeper settings
        const enhancedEnglishVoices = voices.filter(voice => 
          voice.language.startsWith('en') && 
          (voice.quality === 'Enhanced' || 
           voice.name.includes('Enhanced') || 
           voice.name.includes('Neural') ||
           voice.name.includes('Premium'))
        );
        
        // Prefer deep male voices for Filipino accent
        const deepMaleVoices = enhancedEnglishVoices.find(voice => 
          voice.name.toLowerCase().includes('alex') ||
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('fred') ||
          voice.name.toLowerCase().includes('thomas') ||
          voice.name.toLowerCase().includes('ryan') ||
          voice.name.toLowerCase().includes('male')
        );
        
        return deepMaleVoices || enhancedEnglishVoices[0];
        
      } else {
        // American English male voices - prioritize deep, masculine voices
        const americanVoices = voices.filter(voice => 
          (voice.language === 'en-US' || voice.language === 'en_US') &&
          (voice.quality === 'Enhanced' || 
           voice.name.includes('Enhanced') || 
           voice.name.includes('Neural') ||
           voice.name.includes('Premium'))
        );
        
        if (americanVoices.length > 0) {
          // Prioritize specific deep male American voices
          const deepMaleAmerican = americanVoices.find(voice => 
            voice.name.toLowerCase().includes('alex') ||
            voice.name.toLowerCase().includes('daniel') ||
            voice.name.toLowerCase().includes('fred') ||
            voice.name.toLowerCase().includes('thomas') ||
            voice.name.toLowerCase().includes('ryan') ||
            voice.name.toLowerCase().includes('aaron') ||
            voice.name.toLowerCase().includes('male')
          );
          if (deepMaleAmerican) return deepMaleAmerican;
          return americanVoices[0];
        }
      }
      
      // Ultimate fallback to any male voice
      const anyMaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('man') ||
        voice.name.toLowerCase().includes('alex') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('fred') ||
        voice.name.toLowerCase().includes('thomas')
      );
      
      return anyMaleVoice || voices[0];
      
    } catch (error) {
      console.log('Voice selection error:', error);
      return null;
    }
  };

  const speakText = async (text) => {
    try {
      await Speech.stop();
      setIsSpeaking(true);
      
      const isFilipino = voicePreference === 'filipino';
      const naturalText = processTextForSpeech(text, isFilipino);
      const selectedVoice = await selectOptimalVoice(isFilipino);
      
      console.log('Speaking with voice:', selectedVoice?.name, 'Text:', naturalText.substring(0, 50) + '...');
      
      const speechOptions = {
        language: 'en-US', // Always use en-US as base for compatibility
        pitch: isFilipino ? 0.85 : 0.80, // Lower pitch for more masculine voice
        rate: isFilipino ? 0.78 : 0.85, // Slower, more confident pace
        quality: Speech.QUALITY_ENHANCED,
        onDone: () => {
          console.log('Speech finished');
          setIsSpeaking(false);
        },
        onStopped: () => {
          console.log('Speech stopped');
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setIsSpeaking(false);
        },
      };
      
      if (selectedVoice) {
        speechOptions.voice = selectedVoice.identifier;
        console.log('Using voice identifier:', selectedVoice.identifier);
      }
      
      await Speech.speak(naturalText, speechOptions);
      
    } catch (error) {
      console.log('Speech error:', error);
      setIsSpeaking(false);
      // Fallback without voice selection
      try {
        const fallbackOptions = {
          language: 'en-US',
          pitch: 0.80,
          rate: 0.80,
          quality: Speech.QUALITY_ENHANCED,
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        };
        await Speech.speak(processTextForSpeech(text, voicePreference === 'filipino'), fallbackOptions);
      } catch (fallbackError) {
        console.log('Fallback speech error:', fallbackError);
        setIsSpeaking(false);
      }
    }
  };

  const stopSpeaking = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.log('Stop speech error:', error);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required for voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.log('Recording start error:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Here you would typically send the audio to a speech-to-text service
      // For now, we'll simulate with a placeholder
      simulateSpeechToText(uri);
    } catch (error) {
      console.log('Recording stop error:', error);
      Alert.alert('Error', 'Failed to process voice input.');
    }
  };

  const simulateSpeechToText = (audioUri) => {
    // This is a placeholder - in a real app, you'd send the audio to a speech-to-text service
    // like Google Speech-to-Text, Azure Speech, or AWS Transcribe
    
    // For demonstration, we'll show a simple dialog
    Alert.alert(
      'Voice Input',
      'Voice recording completed! In a production app, this would be converted to text using a speech-to-text service.',
      [
        {
          text: 'Add Sample Text',
          onPress: () => setInput('Hello, this is from voice input!')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderMessage = (msg) => (
    <View key={msg.id} style={[styles.messageContainer, msg.sender === 'user' ? styles.userContainer : styles.aiContainer]}>
      <View style={styles.messageRow}>
        {msg.sender === 'ai' && (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </View>
        )}
        
        <View style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.aiText]}>
            {msg.text}
          </Text>
        </View>

        {msg.sender === 'ai' && (
          <TouchableOpacity
            style={styles.speakButton}
            onPress={() => speakText(msg.text)}
          >
            <Ionicons name="volume-high" size={16} color="#0084ff" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[styles.timestamp, msg.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp]}>
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0084ff" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'AI is thinking...' : isSpeaking ? `🗣️ Speaking in ${voicePreference === 'american' ? 'American' : 'Filipino'} masculine voice...` : `Ready to chat (${voicePreference === 'american' ? 'American' : 'Filipino'} masculine voice)`}
            </Text>
          </View>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity 
            onPress={() => setVoicePreference(voicePreference === 'american' ? 'filipino' : 'american')}
            style={styles.voiceToggle}
          >
            <Text style={styles.voiceToggleText}>
              {voicePreference === 'american' ? '🇺🇸' : '🇵🇭'} 
            </Text>
          </TouchableOpacity>
          {isSpeaking && (
            <TouchableOpacity onPress={stopSpeaking} style={styles.headerButton}>
              <Ionicons name="stop" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={styles.statusDot} />
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#0084ff" />
            </View>
            <Text style={styles.welcomeTitle}>Kumusta, brad! Chat with your AI assistant</Text>
            <Text style={styles.welcomeSubtitle}>Mag-usap tayo using text or voice - natural masculine Filipino or American accent!</Text>
            
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => setInput(voicePreference === 'filipino' ? "Ano ba ang pwede mong tulungan sa akin, tsong?" : "What can you help me with, buddy?")}
              >
                <Text style={styles.suggestionText}>
                  {voicePreference === 'filipino' ? "Ano pwede mong tulong?" : "What can you help with?"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => setInput(voicePreference === 'filipino' ? "Sabihin mo naman sa akin ang isang interesting na fact, pre" : "Tell me something interesting, man")}
              >
                <Text style={styles.suggestionText}>
                  {voicePreference === 'filipino' ? "Sabihin mo naman fact" : "Tell me a cool fact"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {messages.map(renderMessage)}

        {loading && (
          <View style={[styles.messageContainer, styles.aiContainer]}>
            <View style={styles.messageRow}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { animationDelay: 0 }]} />
                  <View style={[styles.typingDot, { animationDelay: 200 }]} />
                  <View style={[styles.typingDot, { animationDelay: 400 }]} />
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            disabled={loading}
          >
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={20}
              color={isRecording ? "#fff" : "#0084ff"}
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            placeholder={voicePreference === 'filipino' ? "I-type o hawakan ang mic para magsalita..." : "Type or hold mic to speak..."}
            placeholderTextColor="#8e8e93"
            multiline
            maxLength={1000}
            editable={!loading}
          />
          
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || !input.trim()}
            style={[styles.sendButton, (loading || !input.trim()) && styles.sendButtonDisabled]}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "arrow-up"}
              size={18}
              color="white"
            />
          </TouchableOpacity>
        </View>
        
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              {voicePreference === 'filipino' ? 'Nirerecord... Bitawan para ipadala' : 'Recording... Release to send'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#0084ff',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceToggle: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
  },
  voiceToggleText: {
    fontSize: 16,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#42c767',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1e21',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#65676b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  suggestionsContainer: {
    alignItems: 'center',
    gap: 12,
  },
  suggestionChip: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4e6ea',
  },
  suggestionText: {
    color: '#1c1e21',
    fontSize: 14,
    fontWeight: '400',
  },
  messageContainer: {
    marginBottom: 8,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0084ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#0084ff',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#050505',
  },
  speakButton: {
    padding: 4,
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#8a8d91',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  aiTimestamp: {
    marginLeft: 36,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8a8d91',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: '#e4e6ea',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e4e6ea',
  },
  voiceButtonActive: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1c1e21',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 36,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0084ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#bcc0c4',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 12,
    color: '#ff3b30',
    fontWeight: '500',
  },
});