namespace SASTCsharpBlogPart.Models;

public class User
{
	public int Id { get; set; }
	public string Username { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	public string Password { get; set; } = string.Empty;
	public string Role { get; set; } = "User"; // Admin 或 User
	public string AvatarUrl { get; set; } = string.Empty;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public List<Comment> Comments { get; set; } = new();

}
