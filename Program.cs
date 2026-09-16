using Microsoft.EntityFrameworkCore;
using SASTCsharpBlogPart.Endpoints;
using SASTCsharpBlogPart.Data;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("BlogItemContext")
	?? throw new InvalidOperationException("Connection string 'BlogItemContext' not found.");

builder.Services.AddDbContext<BlogItemContext>(options => options.UseSqlite(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();//注册swagger生成器

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

await app.InitializeAsync();
app.MapBlogItemEndpoints();
app.MapUserEndpoints();
app.MapCommentEndpoints();

app.Run();
