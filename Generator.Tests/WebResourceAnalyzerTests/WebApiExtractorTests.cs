namespace Generator.Tests.WebResourceAnalyzerTests;

/// <summary>
/// Tests for WebApiAttributeExtractor
/// </summary>
public class WebApiExtractorTests : TestBase
{
    #region RetrieveRecord Tests

    [Fact]
    public void WebApiExtractor_RetrieveRecord_WithSelect_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveRecord('account', accountId, '?$select=name,revenue,telephone1')
                .then(function success(result) {
                    console.log(result);
                });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        var selectRefs = results.Where(r => r.Context.Contains("$select")).ToList();
        Assert.Contains(selectRefs, r => r.AttributeName == "name");
        Assert.Contains(selectRefs, r => r.AttributeName == "revenue");
        Assert.Contains(selectRefs, r => r.AttributeName == "telephone1");
        Assert.All(selectRefs, r => Assert.Equal("account", r.EntityName));
        Assert.All(selectRefs, r => Assert.Equal("Read", r.Operation));
    }

    [Fact]
    public void WebApiExtractor_RetrieveRecord_WithFilter_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveRecord('contact', contactId, '?$filter=statecode eq 0')
                .then(function(result) { });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        var filterRefs = results.Where(r => r.Context.Contains("$filter")).ToList();
        Assert.Contains(filterRefs, r => r.AttributeName == "statecode");
        Assert.All(filterRefs, r => Assert.Equal("contact", r.EntityName));
    }

    [Fact]
    public void WebApiExtractor_RetrieveRecord_WithMultipleParameters_ShouldExtractAll()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveRecord('account', id, '?$select=name,revenue&$filter=statecode eq 0')
                .then(success, error);
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name" && r.Context.Contains("$select"));
        Assert.Contains(results, r => r.AttributeName == "revenue" && r.Context.Contains("$select"));
        Assert.Contains(results, r => r.AttributeName == "statecode" && r.Context.Contains("$filter"));
    }

    [Fact]
    public void WebApiExtractor_RetrieveRecord_WithoutQueryString_ShouldReturnEmpty()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveRecord('account', accountId)
                .then(function(result) { });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results);
    }

    #endregion

    #region RetrieveMultipleRecords Tests

    [Fact]
    public void WebApiExtractor_RetrieveMultipleRecords_WithSelect_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveMultipleRecords('contact', '?$select=firstname,lastname,emailaddress1')
                .then(function(results) {
                    console.log(results);
                });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "firstname");
        Assert.Contains(results, r => r.AttributeName == "lastname");
        Assert.Contains(results, r => r.AttributeName == "emailaddress1");
        Assert.All(results, r => Assert.Equal("contact", r.EntityName));
    }

    [Fact]
    public void WebApiExtractor_RetrieveMultipleRecords_WithFilterAndOrderBy_ShouldExtractAll()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveMultipleRecords('account',
                '?$select=name&$filter=revenue gt 100000&$orderby=createdon desc')
                .then(success);
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name" && r.Context.Contains("$select"));
        Assert.Contains(results, r => r.AttributeName == "revenue" && r.Context.Contains("$filter"));
        Assert.Contains(results, r => r.AttributeName == "createdon" && r.Context.Contains("$orderby"));
    }

    [Fact]
    public void WebApiExtractor_RetrieveMultipleRecords_WithComplexFilter_ShouldExtractAllFields()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveMultipleRecords('account',
                '?$filter=statecode eq 0 and revenue gt 100000 and industrycode ne 1')
                .then(function(results) { });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        var filterRefs = results.Where(r => r.Context.Contains("$filter")).ToList();
        Assert.Contains(filterRefs, r => r.AttributeName == "statecode");
        Assert.Contains(filterRefs, r => r.AttributeName == "revenue");
        Assert.Contains(filterRefs, r => r.AttributeName == "industrycode");
    }

    #endregion

    #region CreateRecord Tests

    [Fact(Skip = "Limitation")]
    public void WebApiExtractor_CreateRecord_ShouldExtractDataObjectAttributes()
    {
        // Arrange
        var code = @"
            var data = {
                name: 'Sample Account',
                revenue: 100000,
                telephone1: '555-0123'
            };
            Xrm.WebApi.createRecord('account', data).then(
                function success(result) { },
                function(error) { }
            );
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name" && r.Operation == "Create");
        Assert.Contains(results, r => r.AttributeName == "revenue" && r.Operation == "Create");
        Assert.Contains(results, r => r.AttributeName == "telephone1" && r.Operation == "Create");
        Assert.All(results, r => Assert.Equal("account", r.EntityName));
    }

    [Fact]
    public void WebApiExtractor_CreateRecord_WithInlineObject_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.createRecord('contact', {
                firstname: 'John',
                lastname: 'Doe',
                emailaddress1: 'john@example.com'
            }).then(success, error);
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "firstname");
        Assert.Contains(results, r => r.AttributeName == "lastname");
        Assert.Contains(results, r => r.AttributeName == "emailaddress1");
        Assert.All(results, r => Assert.Equal("contact", r.EntityName));
    }

    [Fact]
    public void WebApiExtractor_CreateRecord_WithLookupBinding_ShouldIgnoreODataAnnotations()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.createRecord('account', {
                name: 'Sample',
                'primarycontactid@odata.bind': '/contacts(guid)'
            });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name");
        Assert.DoesNotContain(results, r => r.AttributeName.Contains("@odata"));
    }

    #endregion

    #region UpdateRecord Tests

    [Fact(Skip = "Limitation")]
    public void WebApiExtractor_UpdateRecord_ShouldExtractDataObjectAttributes()
    {
        // Arrange
        var code = @"
            var data = {
                name: 'Updated Name',
                revenue: 200000
            };
            Xrm.WebApi.updateRecord('account', accountId, data)
                .then(success, error);
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name" && r.Operation == "Update");
        Assert.Contains(results, r => r.AttributeName == "revenue" && r.Operation == "Update");
        Assert.All(results, r => Assert.Equal("account", r.EntityName));
    }

    [Fact]
    public void WebApiExtractor_UpdateRecord_WithInlineObject_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.updateRecord('contact', id, {
                telephone1: '555-9999',
                emailaddress1: 'updated@example.com'
            }).then(function() { });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "telephone1");
        Assert.Contains(results, r => r.AttributeName == "emailaddress1");
    }

    #endregion

    #region DeleteRecord Tests

    [Fact]
    public void WebApiExtractor_DeleteRecord_ShouldNotExtractAttributes()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.deleteRecord('account', accountId)
                .then(success, error);
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void WebApiExtractor_WithMultipleCalls_ShouldExtractFromAll()
    {
        // Arrange
        var code = @"
            Xrm.WebApi.retrieveRecord('account', id1, '?$select=name');
            Xrm.WebApi.retrieveRecord('contact', id2, '?$select=firstname');
            Xrm.WebApi.createRecord('opportunity', { name: 'Deal' });
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.EntityName == "account" && r.AttributeName == "name");
        Assert.Contains(results, r => r.EntityName == "contact" && r.AttributeName == "firstname");
        Assert.Contains(results, r => r.EntityName == "opportunity" && r.AttributeName == "name");
    }

    [Fact]
    public void WebApiExtractor_WithEmptyString_ShouldReturnEmpty()
    {
        // Arrange
        var code = "";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void WebApiExtractor_WithNoWebApiCalls_ShouldReturnEmpty()
    {
        // Arrange
        var code = @"
            console.log('Hello World');
            var data = { name: 'test' };
        ";

        // Act
        var results = WebApiExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results);
    }

    #endregion
}
