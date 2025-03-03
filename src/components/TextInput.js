import React from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';

export default function TextInput({
    label,
    error,
    touched,
    style = {},
    ...props
}) {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <RNTextInput
                style={[
                    styles.input,
                    error && touched && styles.errorInput
                ]}
                placeholderTextColor="#666"
                {...props}
            />
            {error && touched && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
    },
    errorInput: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginTop: 4,
    },
});
