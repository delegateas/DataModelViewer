/// Used in github workflow to generate stubs for data
/// This file is a stub and should not be modified directly.

import { GroupType, SolutionOverviewType } from "@/lib/Types";

export const LastSynched: Date = new Date();
export const Logo: string | null = null;

export let Groups: GroupType[] = [
  {
    "Name": "Sample Data",
    "Entities": [
      {
        "DisplayName": "Account",
        "SchemaName": "Account",
        "Description": "Business organization or customer",
        "Group": "Sample Data",
        "IsAuditEnabled": true,
        "IsActivity": false,
        "IsNotesEnabled": true,
        "Ownership": 1,
        "Attributes": [
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": false,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "HasPluginStep": true,
            "PluginTypeNames": ["Sample Plugin Type"],
            "DisplayName": "Account Name",
            "SchemaName": "name",
            "Description": "The name of the account",
            "RequiredLevel": 2,
            "IsAuditEnabled": true,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Format": "Text",
            "MaxLength": 160
          },
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": false,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "HasPluginStep": false,
            "PluginTypeNames": [],
            "DisplayName": "Phone",
            "SchemaName": "telephone1",
            "Description": "The main phone number for the account",
            "RequiredLevel": 0,
            "IsAuditEnabled": false,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Format": "Phone",
            "MaxLength": 50
          },
          {
            "AttributeType": "LookupAttribute",
            "IsPrimaryId": false,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "HasPluginStep": true,
            "PluginTypeNames": ["Another Plugin Type"],
            "DisplayName": "Primary Contact",
            "SchemaName": "primarycontactid",
            "Description": "The primary contact for the account",
            "RequiredLevel": 0,
            "IsAuditEnabled": true,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Targets": [
              {
                "Name": "Contact",
                "IsInSolution": true
              }
            ]
          }
        ],
        "Relationships": [],
        "SecurityRoles": [],
        "Keys": [],
        "IconBase64": null
      }
    ]
  }
];

export const SolutionOverview: SolutionOverviewType = {
  "Solutions": [
    {
      "SolutionId": "11111111-1111-1111-1111-111111111111",
      "UniqueName": "SampleSolution1",
      "DisplayName": "Sample Solution 1",
      "Components": [
        {
          "ObjectId": "22222222-2222-2222-2222-222222222222",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Account"
        },
        {
          "ObjectId": "33333333-3333-3333-3333-333333333333",
          "ComponentType": 2,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Attribute",
          "ComponentDisplayName": "Account Name"
        },
        {
          "ObjectId": "44444444-4444-4444-4444-444444444444",
          "ComponentType": 20,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Security Role",
          "ComponentDisplayName": "Sales Manager"
        }
      ]
    },
    {
      "SolutionId": "55555555-5555-5555-5555-555555555555",
      "UniqueName": "SampleSolution2",
      "DisplayName": "Sample Solution 2",
      "Components": [
        {
          "ObjectId": "22222222-2222-2222-2222-222222222222",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Account"
        },
        {
          "ObjectId": "66666666-6666-6666-6666-666666666666",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Contact"
        },
        {
          "ObjectId": "77777777-7777-7777-7777-777777777777",
          "ComponentType": 92,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Plugin Step",
          "ComponentDisplayName": "Validate Contact"
        }
      ]
    }
  ],
  "Overlaps": [
    {
      "SolutionNames": ["SampleSolution1"],
      "SharedComponents": [
        {
          "ObjectId": "33333333-3333-3333-3333-333333333333",
          "ComponentType": 2,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Attribute",
          "ComponentDisplayName": "Account Name"
        },
        {
          "ObjectId": "44444444-4444-4444-4444-444444444444",
          "ComponentType": 20,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Security Role",
          "ComponentDisplayName": "Sales Manager"
        }
      ],
      "ComponentCount": 2
    },
    {
      "SolutionNames": ["SampleSolution2"],
      "SharedComponents": [
        {
          "ObjectId": "66666666-6666-6666-6666-666666666666",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Contact"
        },
        {
          "ObjectId": "77777777-7777-7777-7777-777777777777",
          "ComponentType": 92,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Plugin Step",
          "ComponentDisplayName": "Validate Contact"
        }
      ],
      "ComponentCount": 2
    },
    {
      "SolutionNames": ["SampleSolution1", "SampleSolution2"],
      "SharedComponents": [
        {
          "ObjectId": "22222222-2222-2222-2222-222222222222",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Account"
        }
      ],
      "ComponentCount": 1
    }
  ]
};