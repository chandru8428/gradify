from django.urls import path
from . import views

urlpatterns = [
    path('analyse/', views.AnalyseView.as_view(), name='analyse'),
    path('submissions/', views.SubmissionsView.as_view(), name='submissions'),
    path('exams/', views.ExamsView.as_view(), name='exams'),
    path('users/', views.UsersView.as_view(), name='users'),
    path('users/<str:uid>/', views.UserDetailView.as_view(), name='user-detail'),
]
