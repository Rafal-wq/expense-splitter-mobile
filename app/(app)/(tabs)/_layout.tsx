import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="expenses" options={{ title: 'Wydatki' }} />
            <Tabs.Screen name="friends" options={{ title: 'Znajomi' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
        </Tabs>
    );
}
