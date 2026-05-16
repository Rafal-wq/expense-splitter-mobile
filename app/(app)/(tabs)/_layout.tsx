import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NotificationsBell } from '@/components/NotificationsBell';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#0a7ea4',
                tabBarInactiveTintColor: '#687076',
                headerRight: () => <NotificationsBell />,
            }}
        >
            <Tabs.Screen
                name="expenses"
                options={{
                    title: 'Wydatki',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'receipt' : 'receipt-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="friends"
                options={{
                    title: 'Znajomi',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'people' : 'people-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person-circle' : 'person-circle-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
