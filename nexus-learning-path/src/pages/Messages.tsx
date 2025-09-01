import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, Send, MoreVertical } from 'lucide-react';

export const Messages = () => {
  const { t } = useTranslation();
  const [selectedChat, setSelectedChat] = useState<number | null>(0);
  const [newMessage, setNewMessage] = useState('');

  // Mock data - replace with real data later
  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Organization',
      lastMessage: 'Thanks for your proposal. When can we schedule a call?',
      time: '2 min ago',
      unread: 2,
      avatar: 'SJ',
      project: 'Leadership Development Program'
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Professional',
      lastMessage: 'I have experience with similar projects...',
      time: '1 hour ago',
      unread: 0,
      avatar: 'MC',
      project: 'Digital Transformation Training'
    },
    {
      id: 3,
      name: 'Jessica Brown',
      role: 'Organization',
      lastMessage: 'The project timeline looks good to me.',
      time: '3 hours ago',
      unread: 1,
      avatar: 'JB',
      project: 'Sales Team Workshop'
    }
  ];

  const messages = selectedChat !== null ? [
    {
      id: 1,
      sender: 'Sarah Johnson',
      content: 'Hi! I reviewed your application for our Leadership Development Program.',
      time: '10:30 AM',
      isMe: false
    },
    {
      id: 2,
      sender: 'You',
      content: 'Thank you for considering my application. I\'m very excited about this opportunity.',
      time: '10:35 AM',
      isMe: true
    },
    {
      id: 3,
      sender: 'Sarah Johnson',
      content: 'Your experience looks great. Can you tell me more about your approach to leadership training?',
      time: '10:40 AM',
      isMe: false
    },
    {
      id: 4,
      sender: 'You',
      content: 'I focus on experiential learning and practical application. I believe leaders learn best through real scenarios and peer collaboration.',
      time: '10:45 AM',
      isMe: true
    },
    {
      id: 5,
      sender: 'Sarah Johnson',
      content: 'Thanks for your proposal. When can we schedule a call?',
      time: '11:00 AM',
      isMe: false
    }
  ] : [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('messages.title')}</h1>
            <p className="text-muted-foreground">{t('messages.communicate')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="card-professional h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversations
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-10" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {conversations.map((conversation, index) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedChat(index)}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 ${
                          selectedChat === index ? 'bg-muted/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                            {conversation.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium truncate">{conversation.name}</h4>
                              <span className="text-xs text-muted-foreground">{conversation.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-1">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {conversation.project}
                              </Badge>
                              {conversation.unread > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="card-professional h-full flex flex-col">
                {selectedChat !== null ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                            {conversations[selectedChat].avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold">{conversations[selectedChat].name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {conversations[selectedChat].project}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.isMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {message.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    {/* Message Input */}
                    <div className="p-4 border-t border-border/50">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};