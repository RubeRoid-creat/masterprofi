import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { Skill } from '../../types/profile';

interface SkillsManagerProps {
  skills: Skill[];
  onSkillsChange: (skills: Skill[]) => Promise<void>;
}

const APPLIANCE_TYPES = [
  'Washing Machine',
  'Refrigerator',
  'Dishwasher',
  'Oven',
  'Microwave',
  'Air Conditioner',
  'Water Heater',
  'Dryer',
  'Stove',
  'Vacuum Cleaner',
];

const SKILL_LEVELS: Array<{ value: Skill['level']; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  onSkillsChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<Partial<Skill>>({});

  const handleAdd = () => {
    setEditingSkill(null);
    setFormData({});
    setIsModalVisible(true);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData(skill);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.applianceType) {
      Alert.alert('Error', 'Please select an appliance type');
      return;
    }

    const newSkill: Skill = {
      id: editingSkill?.id || Date.now().toString(),
      applianceType: formData.applianceType,
      experienceYears: formData.experienceYears || 0,
      certification: formData.certification,
      level: formData.level || 'intermediate',
    };

    const updatedSkills = editingSkill
      ? skills.map((s) => (s.id === editingSkill.id ? newSkill : s))
      : [...skills, newSkill];

    await onSkillsChange(updatedSkills);
    setIsModalVisible(false);
    setFormData({});
    setEditingSkill(null);
  };

  const handleDelete = (skillId: string) => {
    Alert.alert(
      'Delete Skill',
      'Are you sure you want to delete this skill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onSkillsChange(skills.filter((s) => s.id !== skillId));
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Skills & Specialties</Text>
        <TouchableOpacity onPress={handleAdd}>
          <Text className="text-blue-600 font-medium">+ Add</Text>
        </TouchableOpacity>
      </View>

      {skills.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-gray-500 mb-4">No skills added yet</Text>
          <TouchableOpacity onPress={handleAdd} className="bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Add Your First Skill</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {skills.map((skill) => (
            <View
              key={skill.id}
              className="flex-row items-center justify-between p-4 mb-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {skill.applianceType}
                </Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-sm text-gray-600">
                    {skill.experienceYears} years
                  </Text>
                  <View className="bg-blue-100 px-2 py-1 rounded">
                    <Text className="text-xs font-medium text-blue-800 capitalize">
                      {skill.level}
                    </Text>
                  </View>
                </View>
                {skill.certification && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Certified: {skill.certification}
                  </Text>
                )}
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleEdit(skill)}
                  className="bg-blue-100 px-3 py-2 rounded-lg"
                >
                  <Text className="text-blue-600 text-xs font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(skill.id)}
                  className="bg-red-100 px-3 py-2 rounded-lg"
                >
                  <Text className="text-red-600 text-xs font-medium">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">
              {editingSkill ? 'Edit Skill' : 'Add Skill'}
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Appliance Type */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Appliance Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {APPLIANCE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({ ...formData, applianceType: type })}
                    className={`px-4 py-2 rounded-full border-2 ${
                      formData.applianceType === type
                        ? 'bg-blue-50 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        formData.applianceType === type ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Years */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Years of Experience</Text>
              <TextInput
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                placeholder="0"
                value={formData.experienceYears?.toString() || ''}
                onChangeText={(text) =>
                  setFormData({ ...formData, experienceYears: parseInt(text) || 0 })
                }
                keyboardType="number-pad"
              />
            </View>

            {/* Skill Level */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Skill Level</Text>
              <View className="flex-row flex-wrap gap-2">
                {SKILL_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => setFormData({ ...formData, level: level.value })}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      formData.level === level.value
                        ? 'bg-blue-50 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        formData.level === level.value ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Certification */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Certification (Optional)
              </Text>
              <TextInput
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                placeholder="Certification name or number"
                value={formData.certification || ''}
                onChangeText={(value) => setFormData({ ...formData, certification: value })}
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">Save Skill</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};








