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
      "DisplayName": "Core Platform",
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
        },
        {
          "ObjectId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Opportunity"
        },
        {
          "ObjectId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          "ComponentType": 2,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Attribute",
          "ComponentDisplayName": "Opportunity Name"
        }
      ]
    },
    {
      "SolutionId": "55555555-5555-5555-5555-555555555555",
      "UniqueName": "SampleSolution2",
      "DisplayName": "Sales Module",
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
        },
        {
          "ObjectId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Opportunity"
        },
        {
          "ObjectId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
          "ComponentType": 20,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Security Role",
          "ComponentDisplayName": "Sales Rep"
        },
        {
          "ObjectId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
          "ComponentType": 92,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Plugin Step",
          "ComponentDisplayName": "Calculate Sales Commission"
        }
      ]
    },
    {
      "SolutionId": "88888888-8888-8888-8888-888888888888",
      "UniqueName": "SampleSolution3",
      "DisplayName": "Customer Service",
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
          "ObjectId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Opportunity"
        },
        {
          "ObjectId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Case"
        },
        {
          "ObjectId": "ffffffff-ffff-ffff-ffff-ffffffffffff",
          "ComponentType": 20,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Security Role",
          "ComponentDisplayName": "Support Agent"
        }
      ]
    },
    {
      "SolutionId": "99999999-9999-9999-9999-999999999999",
      "UniqueName": "SampleSolution4",
      "DisplayName": "Reporting Module",
      "Components": [
        {
          "ObjectId": "66666666-6666-6666-6666-666666666666",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Contact"
        },
        {
          "ObjectId": "10101010-1010-1010-1010-101010101010",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Report"
        },
        {
          "ObjectId": "11111110-1111-1111-1111-111111111111",
          "ComponentType": 2,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Attribute",
          "ComponentDisplayName": "Report Title"
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
        },
        {
          "ObjectId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          "ComponentType": 2,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Attribute",
          "ComponentDisplayName": "Opportunity Name"
        }
      ],
      "ComponentCount": 3
    },
    {
      "SolutionNames": ["SampleSolution2"],
      "SharedComponents": [
        {
          "ObjectId": "77777777-7777-7777-7777-777777777777",
          "ComponentType": 92,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Plugin Step",
          "ComponentDisplayName": "Validate Contact"
        },
        {
          "ObjectId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
          "ComponentType": 20,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Security Role",
          "ComponentDisplayName": "Sales Rep"
        },
        {
          "ObjectId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
          "ComponentType": 92,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Plugin Step",
          "ComponentDisplayName": "Calculate Sales Commission"
        }
      ],
      "ComponentCount": 3
    },
    {
      "SolutionNames": ["SampleSolution3"],
      "SharedComponents": [
        {
          "ObjectId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Case"
        },
        {
          "ObjectId": "ffffffff-ffff-ffff-ffff-ffffffffffff",
          "ComponentType": 20,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Security Role",
          "ComponentDisplayName": "Support Agent"
        }
      ],
      "ComponentCount": 2
    },
    {
      "SolutionNames": ["SampleSolution4"],
      "SharedComponents": [
        {
          "ObjectId": "10101010-1010-1010-1010-101010101010",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Report"
        },
        {
          "ObjectId": "11111110-1111-1111-1111-111111111111",
          "ComponentType": 2,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Attribute",
          "ComponentDisplayName": "Report Title"
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
        },
        {
          "ObjectId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Opportunity"
        }
      ],
      "ComponentCount": 2
    },
    {
      "SolutionNames": ["SampleSolution1", "SampleSolution3"],
      "SharedComponents": [
        {
          "ObjectId": "22222222-2222-2222-2222-222222222222",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Account"
        },
        {
          "ObjectId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Opportunity"
        }
      ],
      "ComponentCount": 2
    },
    {
      "SolutionNames": ["SampleSolution2", "SampleSolution3"],
      "SharedComponents": [
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
          "ObjectId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Opportunity"
        }
      ],
      "ComponentCount": 3
    },
    {
      "SolutionNames": ["SampleSolution2", "SampleSolution4"],
      "SharedComponents": [
        {
          "ObjectId": "66666666-6666-6666-6666-666666666666",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Contact"
        }
      ],
      "ComponentCount": 1
    },
    {
      "SolutionNames": ["SampleSolution1", "SampleSolution2", "SampleSolution3"],
      "SharedComponents": [
        {
          "ObjectId": "22222222-2222-2222-2222-222222222222",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Account"
        },
        {
          "ObjectId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          "ComponentType": 1,
          "RootComponentBehavior": 0,
          "ComponentTypeName": "Entity",
          "ComponentDisplayName": "Opportunity"
        }
      ],
      "ComponentCount": 2
    }
  ]
};