import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const DrawerComponent = ({ visible, onClose, onProfile, onLogout }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.drawerContainer}>
          <TouchableOpacity style={styles.drawerOption} onPress={onProfile}>
            <Text style={styles.drawerOptionText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerOption} onPress={onLogout}>
            <Text style={styles.drawerOptionText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  drawerOption: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  drawerOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E232C',
  },
});

export default DrawerComponent;