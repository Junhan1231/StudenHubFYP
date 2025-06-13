import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import icon_Arrow from '../../img/icon_arrow.png'; // ✅ 确保正确导入



const initialCategories = [
    { name: 'Recommend' },
    { name: 'College' },
    { name: 'Housing' },
    { name: 'Visa' },
    { name: 'London' },
    { name: 'Paris' },
    { name: 'New_York' },
    { name: 'Cork' },
];

const CategoryList = ({ categories }: { categories: string[] }) => {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                {initialCategories.map((category, index) => (
                    <TouchableOpacity key={category.name || index} style={styles.tabitem}>
                        <Text style={styles.tabItemTxt}>{category.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.openButton}>
                <Image style={styles.openImg} source={icon_Arrow} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 36,
        flexDirection: 'row',
        backgroundColor: 'white',
    },
    scrollView: {
        flex: 1,
        height: '100%',
    },
    openButton: {
        width: 40,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    openImg: {
        width: 18,
        height: 18,
        transform: [{ rotate: '-90deg' }],
    },
    tabitem: {
        marginLeft: 20,
        width: 70,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabItemTxt: {
        fontSize: 12,
        color: '#999',
    },
});

export default CategoryList;
