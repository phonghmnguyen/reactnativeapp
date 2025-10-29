import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiService.login({ username, password });

            if (response.success && response.token && response.user) {
                // Save authentication data
                await storageService.saveAuthToken(response.token);
                await storageService.saveUserData(response.user);

                // Navigate to the patient list
                router.replace('/patients');
            } else {
                Alert.alert('Login Failed', response.message || 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred during login. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo/Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>💊</Text>
                    </View>
                    <Text style={styles.title}>Medication Reminder</Text>
                    <Text style={styles.subtitle}>Nurse Portal</Text>
                </View>

                {/* Login Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your username"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                            onSubmitEditing={handleLogin}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    {/* Demo credentials hint */}
                    <View style={styles.hintContainer}>
                        <Text style={styles.hintText}>Demo Credentials:</Text>
                        <Text style={styles.hintText}>Username: nurse</Text>
                        <Text style={styles.hintText}>Password: nurse123</Text>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    icon: {
        fontSize: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    loginButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        backgroundColor: '#B0C4DE',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    hintContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#e8f4f8',
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
    },
    hintText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
    },
});
