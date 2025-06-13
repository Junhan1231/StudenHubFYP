import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Footer = () => {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>No more data</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    footerText: {
        color: '#999',
    },
});

export default Footer;
