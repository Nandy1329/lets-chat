import { useState, useEffect } from 'react';
import {
  StyleSheet, View, FlatList, Text,
  TextInput, KeyboardAvoidingView,
  TouchableOpacity, Alert, Platform
} from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const ShoppingLists = ({ db }) => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');

  const fetchShoppingLists = async () => {
    try {
      const listsDocuments = await getDocs(collection(db, 'shoppinglists'));
      const newLists = [];
      listsDocuments.forEach((docObject) => {
        newLists.push({ id: docObject.id, ...docObject.data() });
      });
      setLists(newLists);
    } catch (e) {
      console.error('Failed to fetch lists:', e);
      Alert.alert('Error', 'Unable to fetch shopping lists.');
    }
  };

  const addShoppingList = async (newList) => {
    try {
      const newListRef = await addDoc(collection(db, 'shoppinglists'), newList);
      if (newListRef.id) {
        setLists([{ id: newListRef.id, ...newList }, ...lists]);
        Alert.alert(`The list "${newList.name}" has been added.`);
        setListName('');
        setItem1('');
        setItem2('');
      } else {
        Alert.alert('Unable to add. Please try later');
      }
    } catch (e) {
      console.error('Add list failed:', e);
      Alert.alert('Error', 'Unable to add. Please try later');
    }
  };

  useEffect(() => {
    // Load once on mount (avoid fetch loop)
    fetchShoppingLists();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.listsContainer}
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>
              {item.name}: {Array.isArray(item.items) ? item.items.join(', ') : ''}
            </Text>
          </View>
        )}
      />
      <View style={styles.listForm}>
        <TextInput
          style={styles.listName}
          placeholder="List Name"
          value={listName}
          onChangeText={setListName}
        />
        <TextInput
          style={styles.item}
          placeholder="Item #1"
          value={item1}
          onChangeText={setItem1}
        />
        <TextInput
          style={styles.item}
          placeholder="Item #2"
          value={item2}
          onChangeText={setItem2}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            const name = listName.trim();
            const items = [item1, item2].map((s) => s.trim()).filter(Boolean);
            if (!name || items.length === 0) {
              Alert.alert('Please enter a list name and at least one item.');
              return;
            }
            addShoppingList({ name, items });
          }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === 'ios' ? <KeyboardAvoidingView behavior="padding" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listsContainer: { flex: 1 },
  listItem: {
    height: 70,
    justifyContent: 'center',
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#AAA',
    flex: 1
  },
  listForm: {
    flexBasis: 275,
    margin: 15,
    padding: 15,
    backgroundColor: '#CCC'
  },
  listName: {
    height: 50,
    padding: 15,
    fontWeight: '600',
    marginRight: 50,
    marginBottom: 15,
    borderColor: '#555',
    borderWidth: 2
  },
  item: {
    height: 50,
    padding: 15,
    marginLeft: 50,
    marginBottom: 15,
    borderColor: '#555',
    borderWidth: 2
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#000'
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 20
  }
});

export default ShoppingLists;