/**
 * Example usage of MLMTreeNode component
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { MLMTreeNode } from './MLMTreeNode';
import { MLMMember } from '../../types/mlm';

export const MLMTreeNodeExample = () => {
  const mockMember: MLMMember = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+7 (999) 123-45-67',
    avatar: undefined,
    level: 1,
    status: 'active',
    joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    personalSales: 150000,
    teamSales: 800000,
    directReferrals: 8,
    totalDownline: 45,
    monthlyEarnings: 18000,
    totalEarnings: 95000,
    rank: 'Gold',
    children: [],
  };

  const handlePress = (member: MLMMember) => {
    console.log('Member pressed:', member.id);
    // Navigate to member details
  };

  const handleContact = (member: MLMMember, type: 'call' | 'message') => {
    console.log(`${type} ${member.name}`);
    // Handle contact action
  };

  return (
    <ScrollView className="flex-1 p-4">
      {/* Basic Usage */}
      <MLMTreeNode
        member={mockMember}
        depth={0}
        isExpanded={false}
        onToggle={() => console.log('Toggle')}
        onPress={handlePress}
        onContact={handleContact}
      />

      {/* Expanded Node */}
      <MLMTreeNode
        member={{
          ...mockMember,
          id: '2',
          name: 'Jane Smith',
          rank: 'Platinum',
          level: 2,
          monthlyEarnings: 45000,
          totalDownline: 156,
          directReferrals: 12,
        }}
        depth={0}
        isExpanded={true}
        onToggle={() => console.log('Toggle')}
        onPress={handlePress}
        onContact={handleContact}
        childrenCount={156}
      />

      {/* Nested Node */}
      <MLMTreeNode
        member={{
          ...mockMember,
          id: '3',
          name: 'Bob Johnson',
          rank: 'Silver',
          level: 3,
          monthlyEarnings: 8500,
          totalDownline: 12,
          directReferrals: 4,
          status: 'pending',
        }}
        depth={2}
        isExpanded={false}
        onToggle={() => console.log('Toggle')}
        onPress={handlePress}
        onContact={handleContact}
      />

      {/* Inactive Member */}
      <MLMTreeNode
        member={{
          ...mockMember,
          id: '4',
          name: 'Alice Williams',
          rank: 'Bronze',
          status: 'inactive',
          monthlyEarnings: 0,
          totalDownline: 0,
          directReferrals: 0,
        }}
        depth={0}
        isExpanded={false}
        onToggle={() => console.log('Toggle')}
        onPress={handlePress}
        onContact={handleContact}
        showChildren={false}
      />
    </ScrollView>
  );
};








