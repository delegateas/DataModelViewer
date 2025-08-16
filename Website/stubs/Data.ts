/// Used in github workflow to generate stubs for data
/// This file is a stub and should not be modified directly.

import { GroupType } from "@/lib/Types";

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