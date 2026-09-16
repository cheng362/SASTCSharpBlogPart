using System.ComponentModel.DataAnnotations.Schema;

namespace SASTCsharpBlogPart.Models;

public class Comment
{
	public int Id { get; set; }
	public string Content { get; set; } = string.Empty;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	// 外键：关联的文章
	public int BlogItmId { get; set; }
	[ForeignKey(nameof(BlogItmId))]
	public BlogItem? BlogItem { get; set; }

	// 外键：关联发表评论的用户
	public int UserId { get; set; }
	[ForeignKey(nameof(UserId))]
	public User? User { get; set; }

	// 外键：支持楼中楼回复
	public int? ParentId { get; set; }
	[ForeignKey(nameof(ParentId))]
	public Comment? Parent { get; set; }
	public List<Comment> Replies { get; set; } = new();
}
