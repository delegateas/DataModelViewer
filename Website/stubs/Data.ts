/// Used in github workflow to generate stubs for data
/// This file is a stub and should not be modified directly.

import { GroupType, SolutionType, SolutionWarningType } from "@/lib/Types";

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
        "IsCustom": true,
        "Ownership": 1,
        "Attributes": [
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": true,
            "IsPrimaryName": false,
            "IsCustomAttribute": false,
            "IsStandardFieldModified": false,
            "DisplayName": "Account ID",
            "SchemaName": "accountid",
            "Description": "Unique identifier for the account",
            "RequiredLevel": 3,
            "IsAuditEnabled": false,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Format": "Text",
            "MaxLength": 100,
            "AttributeUsages": []
          },
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": false,
            "IsPrimaryName": true,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "DisplayName": "Account Name",
            "SchemaName": "name",
            "Description": "The name of the account",
            "RequiredLevel": 2,
            "IsAuditEnabled": true,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Format": "Text",
            "MaxLength": 160,
            "AttributeUsages": []
          },
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": false,
            "IsPrimaryName": false,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "DisplayName": "Phone",
            "SchemaName": "telephone1",
            "Description": "The main phone number for the account",
            "RequiredLevel": 0,
            "IsAuditEnabled": false,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Format": "Phone",
            "MaxLength": 50,
            "AttributeUsages": []
          },
          {
            "AttributeType": "LookupAttribute",
            "IsPrimaryId": false,
            "IsPrimaryName": false,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "DisplayName": "Primary Contact",
            "SchemaName": "primarycontactid",
            "Description": "The primary contact for the account",
            "RequiredLevel": 0,
            "IsAuditEnabled": true,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "AttributeUsages": [],
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

export let SolutionWarnings: SolutionWarningType[] = [];

export let Solutions: SolutionType[] = [
  {
    Name: "Sample Solution",
    PublisherName: "Contoso",
    PublisherPrefix: "contoso",
    Components: [
      {
        Name: "Sample Entity",
        SchemaName: "contoso_entity",
        Description: "A sample entity for demonstration purposes.",
        ComponentType: 1,
        PublisherName: "Contoso",
        PublisherPrefix: "contoso"
      },
      {
        Name: "Sample Attribute",
        SchemaName: "contoso_attribute",
        Description: "A sample attribute for demonstration purposes.",
        ComponentType: 2,
        PublisherName: "Contoso",
        PublisherPrefix: "contoso"
      }
    ]
  },
  {
    Name: "Microsoft Solution",
    PublisherName: "Microsoft",
    PublisherPrefix: "msft",
    Components: [
      {
        Name: "Account Entity",
        SchemaName: "account",
        Description: "Standard account entity.",
        ComponentType: 1,
        PublisherName: "Microsoft",
        PublisherPrefix: ""
      },
      {
        Name: "Contact Entity",
        SchemaName: "contact",
        Description: "Standard contact entity.",
        ComponentType: 1,
        PublisherName: "Microsoft",
        PublisherPrefix: ""
      },
      {
        Name: "Lead Entity",
        SchemaName: "lead",
        Description: "Standard lead entity.",
        ComponentType: 1,
        PublisherName: "Microsoft",
        PublisherPrefix: ""
      },
      {
        Name: "Opportunity Entity",
        SchemaName: "opportunity",
        Description: "Standard opportunity entity.",
        ComponentType: 1,
        PublisherName: "Microsoft",
        PublisherPrefix: ""
      },
      {
        Name: "Email Relationship",
        SchemaName: "email_account",
        Description: "Email to account relationship.",
        ComponentType: 3,
        PublisherName: "Microsoft",
        PublisherPrefix: ""
      }
    ]
  },
  {
    Name: "Fabrikam Solution",
    PublisherName: "Fabrikam",
    PublisherPrefix: "fab",
    Components: [
      {
        Name: "Custom Project Entity",
        SchemaName: "fab_project",
        Description: "Custom project tracking entity.",
        ComponentType: 1,
        PublisherName: "Fabrikam",
        PublisherPrefix: "fab"
      },
      {
        Name: "Custom Task Entity",
        SchemaName: "fab_task",
        Description: "Custom task entity.",
        ComponentType: 1,
        PublisherName: "Fabrikam",
        PublisherPrefix: "fab"
      },
      {
        Name: "Custom Attribute",
        SchemaName: "fab_priority",
        Description: "Priority attribute.",
        ComponentType: 2,
        PublisherName: "Fabrikam",
        PublisherPrefix: "fab"
      }
    ]
  },
  {
    Name: "AdventureWorks Solution",
    PublisherName: "AdventureWorks",
    PublisherPrefix: "adv",
    Components: [
      {
        Name: "Product Entity",
        SchemaName: "adv_product",
        Description: "Product catalog entity.",
        ComponentType: 1,
        PublisherName: "AdventureWorks",
        PublisherPrefix: "adv"
      }
    ]
  }
];