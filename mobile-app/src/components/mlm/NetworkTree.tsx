import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MLMMember } from '../../types/mlm';
import { MLMTreeNode } from './MLMTreeNode';

interface NetworkTreeProps {
  rootMember: MLMMember;
  maxDepth?: number;
  onMemberPress?: (member: MLMMember) => void;
  onMemberContact?: (member: MLMMember, type: 'call' | 'message') => void;
}

const RecursiveTreeNode: React.FC<{
  member: MLMMember;
  depth: number;
  maxDepth: number;
  onMemberPress?: (member: MLMMember) => void;
  onMemberContact?: (member: MLMMember, type: 'call' | 'message') => void;
}> = ({ member, depth, maxDepth, onMemberPress, onMemberContact }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const hasChildren = member.children && member.children.length > 0;

  return (
    <View>
      <MLMTreeNode
        member={member}
        depth={depth}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        onPress={onMemberPress}
        onContact={onMemberContact}
        showChildren={depth < maxDepth}
        childrenCount={member.totalDownline}
      />

      {/* Render Children */}
      {isExpanded && hasChildren && depth < maxDepth && (
        <View>
          {member.children!.map((child) => (
            <RecursiveTreeNode
              key={child.id}
              member={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              onMemberPress={onMemberPress}
              onMemberContact={onMemberContact}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const NetworkTree: React.FC<NetworkTreeProps> = ({
  rootMember,
  maxDepth = 5,
  onMemberPress,
  onMemberContact,
}) => {
  const [rootExpanded, setRootExpanded] = useState(true);

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Network Tree</Text>
        <TouchableOpacity
          onPress={() => setRootExpanded(!rootExpanded)}
          className="px-3 py-1 bg-gray-100 rounded-lg"
        >
          <Text className="text-sm text-gray-700">
            {rootExpanded ? 'Collapse All' : 'Expand All'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="max-h-96"
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <MLMTreeNode
          member={rootMember}
          depth={0}
          isExpanded={rootExpanded}
          onToggle={() => setRootExpanded(!rootExpanded)}
          onPress={onMemberPress}
          onContact={onMemberContact}
          showChildren={true}
          childrenCount={rootMember.totalDownline}
        />
        {rootExpanded && rootMember.children && rootMember.children.length > 0 && (
          <View>
            {rootMember.children.map((child) => (
              <RecursiveTreeNode
                key={child.id}
                member={child}
                depth={1}
                maxDepth={maxDepth}
                onMemberPress={onMemberPress}
                onMemberContact={onMemberContact}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

