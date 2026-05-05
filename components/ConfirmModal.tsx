import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    visible,
    title,
    message,
    confirmText = 'Potwierdź',
    cancelText = 'Anuluj',
    destructive = false,
    onConfirm,
    onCancel,
}: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, destructive && styles.destructiveButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    container: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    message: {
        fontSize: 15,
        color: '#687076',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 15,
        color: '#687076',
        fontWeight: '500',
    },
    confirmButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#0a7ea4',
        alignItems: 'center',
    },
    destructiveButton: {
        backgroundColor: '#ff3b30',
    },
    confirmText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
});
