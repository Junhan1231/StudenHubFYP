import React from 'react';
import { FlatList, Text, View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ArticleList = ({ articles }: { articles: any[] }) => {
    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.titleTxt}>{item.title}</Text>
            <View style={styles.nameLayout}>
                <Image style={styles.avatarImg} source={{ uri: item.avatarUrl }} />
                <Text style={styles.nameTxt}>{item.userName}</Text>
                <Text style={styles.countTxt}>{item.favoriteCount}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={articles}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            style={styles.flatList}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    flatList: {
        width: '100%',
        height: '100%',
    },
    container: {
        // paddingTop: 6,
    },
    item: {
        width: SCREEN_WIDTH - 18 >> 1,
        backgroundColor: 'white',
        marginLeft: 6,
        marginBottom: 6,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
    },
    titleTxt: {
        fontSize: 14,
        color: '#333',
        marginHorizontal: 10,
        marginVertical: 4,
    },
    nameLayout: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    avatarImg: {
        width: 20,
        height: 20,
        resizeMode: 'cover',
        borderRadius: 10,
    },
    nameTxt: {
        fontSize: 12,
        color: '#999',
        marginLeft: 6,
        flex: 1,
    },
    countTxt: {
        fontSize: 14,
        color: '#999',
        marginLeft: 4,
    },
});


export default ArticleList;
