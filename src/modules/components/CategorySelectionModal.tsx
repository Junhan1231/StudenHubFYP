import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import icon_Arrow from '../../img/icon_arrow.png';

const categories = [
    'Recommend', 'College', 'Housing', 'Visa', '音乐', '科技数码', '游戏', '情感',
    '家装', '职场', '科学科普', '家居', '手工', '露营', '旅行', '萌宠',
    '学习', '绘画', '潮玩手办', '机车', '文具手账', '社科'
];

// ✅ 固定频道（不能删除）
const fixedChannels = ['Recommend', 'College', 'Housing', 'Visa'];

interface CategorySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onUpdate: (channels: string[]) => void; // ✅ 新增
  }
  

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({ visible, onClose,onUpdate}) => {
    const [myChannels, setMyChannels] = useState<string[]>([...fixedChannels, '音乐', '直播']); // ✅ `固定频道` + `用户选的`
    const otherChannels = categories.filter((item) => !myChannels.includes(item)); // ✅ 未加入的频道
    

    /** ✅ 处理频道点击事件 */
    const handleChannelPress = (channel: string) => {
        if (fixedChannels.includes(channel)) return; // ❌ 不能删除固定频道
        if (myChannels.includes(channel)) {
            setMyChannels(myChannels.filter((item) => item !== channel)); // ✅ 移除频道
        } else {
            setMyChannels([...myChannels, channel]); // ✅ 添加频道
        }
    };

    /** ✅ 渲染 `My channel` 列表 */
    const renderMyList = () => (
        <View>
            <View style={styles.row}>
                <Text style={styles.titleTxt}>My Channel</Text>
                <Text style={styles.subTitleTxt}>Click to remove</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Image style={styles.closeImg} source={icon_Arrow} />
                </TouchableOpacity>
            </View>
            <View style={styles.listContent}>
                {myChannels.map((channel) => {
                    const isFixed = fixedChannels.includes(channel); // ✅ 是否是固定频道
                    return (
                        <TouchableOpacity
                            key={channel}
                            style={[
                                styles.categoryItem,
                                isFixed && styles.fixedCategoryItem, // ✅ 选中固定频道样式
                            ]}
                            onPress={() => handleChannelPress(channel)}
                            
                            disabled={isFixed} // ❌ 不能点击删除
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    isFixed && styles.fixedCategoryText, // ✅ 选中文字样式
                                ]}
                            >
                                {channel}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    /** ✅ 渲染 `Other channels` 列表 */
    const renderOtherList = () => (
        <View>
            <Text style={[styles.titleTxt, { marginTop: 20 }]}>Other Channels</Text>
            <View style={styles.listContent}>
                {otherChannels.map((channel) => (
                    <TouchableOpacity key={channel} style={styles.categoryItem} onPress={() => handleChannelPress(channel)}>
                        <Text style={styles.categoryText}>{channel}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {renderMyList()}
                    {renderOtherList()}
                </View>
                <View style={styles.mask} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        paddingTop: 20,
    },
    modalContainer: {
        width: '100%',
        height: '49%',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        marginTop: 86,
    },
    mask: {
        width: '100%',
        flex: 1,
        backgroundColor: '#00000060',
    },
    titleTxt: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    subTitleTxt: {
        fontSize: 14,
        color: '#999',
        marginLeft: 12,
        marginRight:145,


    },

    editTxt: {
        fontSize: 13,
        color: '#3050ff',
    },
    closeButton: {
        padding: 12,
    },
    closeImg: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        transform: [{ rotate: '90deg' }],
    },
    listContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    categoryItem: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: 'White',
        borderWidth:1,
        borderColor:'#eee',
        borderRadius: 4,
        marginRight: 10,
        marginBottom: 10,
    },
    categoryText: {
        fontSize: 14,
        color: '#333',
    },
    fixedCategoryItem: {
        backgroundColor: '#ddd', // ✅ 固定频道的背景颜色更深
    },
    fixedCategoryText: {
        color: '#666', // ✅ 固定频道的文字颜色更深
        fontWeight: 'bold',
    },
    
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
});

export default CategorySelectionModal;
